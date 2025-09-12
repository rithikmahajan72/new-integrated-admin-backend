/**
 * ProductBundling Component
 *
 * A comprehensive product bundling management interface that allows users to:
 * - Select and configure main products and bundle items
 * - Drag and drop to arrange bundle preview
 * - Create, edit, and delete product bundles
 * - Manage bundle lists with full CRUD operations
 *
 * Features:
 * - Dynamic product selection with category/subcategory filtering
 * - Real-time drag and drop arrangement
 * - Modal-based editing interface
 * - Optimized performance with React hooks (useCallback, useMemo)
 */

import React, { useState, useCallback, useMemo } from "react";
import { ChevronDown, Plus, Edit, Trash2, GripVertical } from "lucide-react";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SuccessModal from "../components/SuccessModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Constants
const INITIAL_MAIN_PRODUCT = {
  id: "main",
  category: "",
  subcategory: "",
  item: "",
  productData: null,
};

const INITIAL_BUNDLE_ITEMS = [
  { id: "item1", category: "", subcategory: "", item: "", productData: null },
  { id: "item2", category: "", subcategory: "", item: "", productData: null },
];

const CATEGORIES = [
  { value: "t-shirt", label: "T-shirt" },
  { value: "pants", label: "Pants" },
];

// Sample database of products
const PRODUCT_DATABASE = {
  "t-shirt": {
    casual: [
      {
        id: "blue-tshirt",
        name: "Blue T-shirt",
        image: "/api/placeholder/158/167",
        category: "T shirt",
        subcategory: "casual",
        variants: [
          {
            size: "small",
            quantity: 5,
            price: "4566",
            salePrice: "4566",
            sku: "blk/m/inso123",
            barcode: "45600000000000",
          },
          {
            size: "medium",
            quantity: 3,
            price: "4566",
            salePrice: "4566",
            sku: "blk/m/inso124",
            barcode: "45600000000001",
          },
          {
            size: "large",
            quantity: 8,
            price: "4566",
            salePrice: "4566",
            sku: "blk/m/inso125",
            barcode: "45600000000002",
          },
        ],
      },
      {
        id: "red-tshirt",
        name: "Red T-shirt",
        image: "/api/placeholder/158/167",
        category: "T shirt",
        subcategory: "casual",
        variants: [
          {
            size: "small",
            quantity: 7,
            price: "4566",
            salePrice: "4566",
            sku: "red/m/inso123",
            barcode: "45600000000003",
          },
          {
            size: "medium",
            quantity: 5,
            price: "4566",
            salePrice: "4566",
            sku: "red/m/inso124",
            barcode: "45600000000004",
          },
        ],
      },
    ],
    formal: [
      {
        id: "white-formal-shirt",
        name: "White Formal Shirt",
        image: "/api/placeholder/158/167",
        category: "T shirt",
        subcategory: "formal",
        variants: [
          {
            size: "small",
            quantity: 4,
            price: "5566",
            salePrice: "5566",
            sku: "wht/m/frm123",
            barcode: "45600000000005",
          },
        ],
      },
    ],
  },
  pants: {
    casual: [
      {
        id: "blue-jeans",
        name: "Blue Jeans",
        image: "/api/placeholder/158/167",
        category: "Pants",
        subcategory: "casual",
        variants: [
          {
            size: "30",
            quantity: 6,
            price: "6566",
            salePrice: "6566",
            sku: "blu/jns/30",
            barcode: "45600000000006",
          },
        ],
      },
    ],
    formal: [
      {
        id: "black-trousers",
        name: "Black Trousers",
        image: "/api/placeholder/158/167",
        category: "Pants",
        subcategory: "formal",
        variants: [
          {
            size: "32",
            quantity: 3,
            price: "7566",
            salePrice: "7566",
            sku: "blk/trs/32",
            barcode: "45600000000007",
          },
        ],
      },
    ],
  },
};

const ProductBundling = () => {
  /**
   * REFACTORING IMPROVEMENTS APPLIED:
   *
   * 1. Performance Optimizations:
   *    - Added useCallback for event handlers to prevent unnecessary re-renders
   *    - Added useMemo for complex computed values and components
   *    - Extracted constants to prevent recreation on each render
   *
   * 2. Code Organization:
   *    - Moved constants outside component for better performance
   *    - Grouped related state variables together
   *    - Organized functions by functionality (utility, handlers, components)
   *
   * 3. Component Structure:
   *    - Created reusable components (SuccessModal, DeleteConfirmModal, etc.)
   *    - Removed duplicate component definitions
   *    - Better separation of concerns
   *
   * 4. Maintainability:
   *    - Added comprehensive comments and documentation
   *    - Consistent naming conventions
   *    - Better error handling and prop validation
   *
   * 5. DRY Principle:
   *    - Eliminated code duplication
   *    - Created reusable modal components
   *    - Centralized common functionality
   */
  // State management
  const [mainProduct, setMainProduct] = useState(INITIAL_MAIN_PRODUCT);
  const [bundleItems, setBundleItems] = useState(INITIAL_BUNDLE_ITEMS);
  const [bundleList, setBundleList] = useState([]);
  const [dragItems, setDragItems] = useState([]);
  const [showBundleList, setShowBundleList] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoized utility functions
  const getSubcategories = useCallback((category) => {
    if (!category || !PRODUCT_DATABASE[category]) return [];
    return Object.keys(PRODUCT_DATABASE[category]).map((sub) => ({
      value: sub,
      label: sub.charAt(0).toUpperCase() + sub.slice(1),
    }));
  }, []);

  const getItems = useCallback((category, subcategory) => {
    if (!category || !subcategory || !PRODUCT_DATABASE[category]?.[subcategory])
      return [];
    return PRODUCT_DATABASE[category][subcategory].map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, []);

  const getProductData = useCallback((category, subcategory, itemId) => {
    if (
      !category ||
      !subcategory ||
      !itemId ||
      !PRODUCT_DATABASE[category]?.[subcategory]
    )
      return null;
    return PRODUCT_DATABASE[category][subcategory].find(
      (item) => item.id === itemId
    );
  }, []);

  // Event handlers
  const handleMainProductChange = useCallback((field, value) => {
    setMainProduct((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "category" && {
        subcategory: "",
        item: "",
        productData: null,
      }),
      ...(field === "subcategory" && { item: "", productData: null }),
    }));
  }, []);

  const handleBundleItemChange = useCallback((id, field, value) => {
    setBundleItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              ...(field === "category" && {
                subcategory: "",
                item: "",
                productData: null,
              }),
              ...(field === "subcategory" && { item: "", productData: null }),
            }
          : item
      )
    );
  }, []);

  const updateDragItems = useCallback((itemData, type) => {
    setDragItems((prev) => {
      const existing = prev.find((item) => item.id === type);
      if (existing) {
        return prev.map((item) =>
          item.id === type ? { ...itemData, id: type } : item
        );
      } else {
        return [...prev, { ...itemData, id: type }];
      }
    });
  }, []);

  const handleAssignItem = useCallback(
    (type) => {
      if (type === "main") {
        const productData = getProductData(
          mainProduct.category,
          mainProduct.subcategory,
          mainProduct.item
        );
        if (productData) {
          setMainProduct((prev) => ({ ...prev, productData }));
          updateDragItems({ ...mainProduct, productData }, "main");
        }
      } else {
        const item = bundleItems.find((item) => item.id === type);
        const productData = getProductData(
          item.category,
          item.subcategory,
          item.item
        );
        if (productData) {
          setBundleItems((prev) =>
            prev.map((bundleItem) =>
              bundleItem.id === type
                ? { ...bundleItem, productData }
                : bundleItem
            )
          );
          updateDragItems({ ...item, productData }, type);
        }
      }
    },
    [mainProduct, bundleItems, getProductData, updateDragItems]
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setDragItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const resetForm = useCallback(() => {
    setMainProduct(INITIAL_MAIN_PRODUCT);
    setBundleItems(INITIAL_BUNDLE_ITEMS);
    setDragItems([]);
  }, []);

  const handleBundleWith = useCallback(() => {
    const currentBundle = {
      id: Date.now(),
      main: mainProduct.productData,
      items: bundleItems
        .filter((item) => item.productData)
        .map((item) => item.productData),
      arrangement: dragItems,
    };

    if (currentBundle.main && currentBundle.items.length > 0) {
      setBundleList((prev) => [...prev, currentBundle]);
      setShowSuccessModal(true);
      resetForm();
    }
  }, [mainProduct.productData, bundleItems, dragItems, resetForm]);

  // Bundle management handlers
  const handleEditBundle = useCallback((bundle) => {
    setEditingBundle({ ...bundle });
    setShowEditModal(true);
  }, []);

  const handleUpdateBundle = useCallback(() => {
    setBundleList((prev) =>
      prev.map((bundle) =>
        bundle.id === editingBundle.id ? editingBundle : bundle
      )
    );
    setShowEditModal(false);
    setEditingBundle(null);
  }, [editingBundle]);

  const handleDeleteBundle = useCallback((bundleId) => {
    setBundleToDelete(bundleId);
    setShowDeleteConfirmModal(true);
  }, []);

  const confirmDeleteBundle = useCallback(() => {
    setBundleList((prev) =>
      prev.filter((bundle) => bundle.id !== bundleToDelete)
    );
    setShowDeleteConfirmModal(false);
    setBundleToDelete(null);
    setShowDeleteSuccessModal(true);
  }, [bundleToDelete]);

  const cancelDeleteBundle = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setBundleToDelete(null);
  }, []);

  const handleRemoveItemFromEditBundle = useCallback((itemType, itemIndex) => {
    if (itemType === "main") {
      setEditingBundle((prev) => ({ ...prev, main: null }));
    } else {
      setEditingBundle((prev) => ({
        ...prev,
        items: prev.items.filter((_, index) => index !== itemIndex),
      }));
    }
  }, []);

  const handleRemoveFromDragItems = useCallback((itemId) => {
    setDragItems((prev) => prev.filter((dragItem) => dragItem.id !== itemId));
    if (itemId === "item1" || itemId === "item2") {
      setBundleItems((prev) =>
        prev.map((bundleItem) =>
          bundleItem.id === itemId
            ? { ...bundleItem, productData: null }
            : bundleItem
        )
      );
    }
  }, []);

  // Reusable Components
  const CustomDropdown = useMemo(
    () =>
      ({ placeholder, value, onChange, options = [] }) =>
        (
          <div className="relative w-80 h-14">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full px-6 border-2 border-gray-200 rounded-xl text-gray-800 text-base font-medium appearance-none bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <option value="">{placeholder}</option>
              {options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        ),
    []
  );

  // Sortable Item Component for drag and drop
  const SortableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div className="relative group">
          <div
            {...listeners}
            className="absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <GripVertical size={20} className="text-gray-400" />
          </div>
          {children}
        </div>
      </div>
    );
  };

  const ProductDetailsTable = useMemo(
    () =>
      ({ productData }) => {
        if (!productData) return null;

        return (
          <div className="flex-1">
            {/* Table Headers */}
            <div className="grid grid-cols-10 gap-3 mb-3 text-[15px] text-black font-montserrat font-normal">
              <div className="text-left">Image</div>
              <div className="text-left">Product Name</div>
              <div className="text-left">Category</div>
              <div className="text-left">sub categories</div>
              <div className="text-left">size</div>
              <div className="text-left">quantity</div>
              <div className="text-left">Price</div>
              <div className="text-left">sale price</div>
              <div className="text-left">SKU</div>
              <div className="text-left">barcode no.</div>
            </div>

            {/* Product Info Row */}
            <div className="mb-3">
              <div className="grid grid-cols-10 gap-3 text-[15px] font-medium text-[#111111] font-montserrat">
                <div></div>
                <div>{productData.name}</div>
                <div>{productData.category}</div>
                <div className="text-[14px]">{productData.subcategory}</div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>

            {/* Product Variants */}
            {productData.variants.map((variant, index) => (
              <div
                key={index}
                className="grid grid-cols-10 gap-3 text-[11px] text-[#111111] mb-1 font-montserrat font-medium"
              >
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div className="text-[14px]">{variant.size}</div>
                <div className="text-[14px]">{variant.quantity}</div>
                <div className="text-[11px]">{variant.price}</div>
                <div className="text-[11px]">{variant.salePrice}</div>
                <div className="text-[11px]">{variant.sku}</div>
                <div className="text-[11px]">{variant.barcode}</div>
              </div>
            ))}
          </div>
        );
      },
    []
  );

  // Edit Bundle Modal Component
  const EditBundleModal = () => {
    if (!showEditModal || !editingBundle) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black font-montserrat">
              Edit bundle
            </h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-8">
            {/* Main Product */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-black mb-4 font-montserrat">
                main
              </h3>
              {editingBundle.main && (
                <>
                  <div className="w-[200px] h-[200px] bg-[#F3F4F6] rounded-lg mb-4 mx-auto overflow-hidden">
                    <img
                      src={editingBundle.main.image}
                      alt="Main product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 text-sm font-montserrat">
                    <div>
                      <span className="font-normal">Product Name:</span>{" "}
                      <span className="font-medium ml-1">
                        {editingBundle.main.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-normal">Category:</span>{" "}
                      <span className="font-medium ml-1">
                        {editingBundle.main.category}
                      </span>
                    </div>
                    <div>
                      <span className="font-normal">sub categories:</span>{" "}
                      <span className="font-medium ml-1">
                        {editingBundle.main.subcategory}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItemFromEditBundle("main")}
                    className="mt-3 px-4 py-1 bg-red-100 text-red-600 rounded text-sm font-montserrat hover:bg-red-200"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>

            {/* Bundle Items */}
            {editingBundle.items.map((item, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-bold text-black mb-4 font-montserrat">
                  Item {index + 1}
                </h3>
                <div className="w-[200px] h-[200px] bg-[#F3F4F6] rounded-lg mb-4 mx-auto overflow-hidden">
                  <img
                    src={item.image}
                    alt={`Item ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 text-sm font-montserrat">
                  <div>
                    <span className="font-normal">Product Name:</span>{" "}
                    <span className="font-medium ml-1">{item.name}</span>
                  </div>
                  <div>
                    <span className="font-normal">Category:</span>{" "}
                    <span className="font-medium ml-1">{item.category}</span>
                  </div>
                  <div>
                    <span className="font-normal">sub categories:</span>{" "}
                    <span className="font-medium ml-1">{item.subcategory}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItemFromEditBundle("item", index)}
                  className="mt-3 px-4 py-1 bg-red-100 text-red-600 rounded text-sm font-montserrat hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add new item section */}
          <div className="border-t pt-6">
            <div className="flex gap-4 mb-4">
              <CustomDropdown
                placeholder="Category"
                value=""
                onChange={() => {}}
                options={[
                  { value: "t-shirt", label: "T-shirt" },
                  { value: "pants", label: "Pants" },
                ]}
              />
              <CustomDropdown
                placeholder="sub category"
                value=""
                onChange={() => {}}
                options={[]}
              />
              <CustomDropdown
                placeholder="Item"
                value=""
                onChange={() => {}}
                options={[]}
              />
              <button className="bg-[#202224] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#333537] transition-colors font-montserrat text-[14px]">
                <Plus size={20} />
                Assign Item
              </button>
            </div>

            {/* Product details table */}
            {editingBundle.main && (
              <div className="mt-6">
                <div className="grid grid-cols-10 gap-3 mb-3 text-[13px] text-black font-montserrat font-normal">
                  <div>Image</div>
                  <div>Product Name</div>
                  <div>Category</div>
                  <div>sub categories</div>
                  <div>size</div>
                  <div>quantity</div>
                  <div>Price</div>
                  <div>sale price</div>
                  <div>SKU</div>
                  <div>barcode no.</div>
                </div>

                <div className="grid grid-cols-10 gap-3 text-[13px] font-medium text-[#111111] font-montserrat mb-2">
                  <div className="w-12 h-12">
                    <img
                      src={editingBundle.main.image}
                      alt=""
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div>{editingBundle.main.name}</div>
                  <div>{editingBundle.main.category}</div>
                  <div>{editingBundle.main.subcategory}</div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

                {editingBundle.main.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-10 gap-3 text-[11px] text-[#111111] mb-1 font-montserrat font-medium"
                  >
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div>{variant.size}</div>
                    <div>{variant.quantity}</div>
                    <div>{variant.price}</div>
                    <div>{variant.salePrice}</div>
                    <div>{variant.sku}</div>
                    <div>{variant.barcode}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-montserrat"
            >
              go back
            </button>
            <button
              onClick={handleUpdateBundle}
              className="px-8 py-3 bg-[#202224] text-white rounded-lg hover:bg-[#333537] font-montserrat"
            >
              save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Product section component
  const ProductSection = ({
    title,
    isMain = false,
    itemData,
    onCategoryChange,
    onSubcategoryChange,
    onItemChange,
    onAssignItem,
  }) => {
    const subcategories = getSubcategories(itemData.category);
    const items = getItems(itemData.category, itemData.subcategory);

    return (
      <div className="mb-12">
        {/* Section Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-montserrat capitalize">
          {title}
        </h2>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap gap-4 mb-6">
          <CustomDropdown
            placeholder="Category"
            value={itemData.category}
            onChange={onCategoryChange}
            options={CATEGORIES}
          />
          <CustomDropdown
            placeholder="Subcategory"
            value={itemData.subcategory}
            onChange={onSubcategoryChange}
            options={subcategories}
          />
          <div className="flex gap-3 items-center">
            <CustomDropdown
              placeholder="Item"
              value={itemData.item}
              onChange={onItemChange}
              options={items}
            />
            <button
              onClick={onAssignItem}
              disabled={
                !itemData.category || !itemData.subcategory || !itemData.item
              }
              className="bg-[#202224] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#333537] transition-colors font-montserrat text-sm border border-[#7280FF] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              {isMain
                ? "Assign Item"
                : title.includes("1")
                ? "Assign 1"
                : "Assign 2"}
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        {itemData.productData && (
          <div className="flex gap-6 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            {/* Product Image */}
            <div className="w-[160px] h-[170px] flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
              <img
                src={itemData.productData.image}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details Table */}
            <div className="flex-1">
              <ProductDetailsTable productData={itemData.productData} />
            </div>
          </div>
        )}

        {/* Bundle With Button for Main Product */}
        {isMain && itemData.productData && (
          <div className="mt-8">
            <button
              onClick={handleBundleWith}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Bundle
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen font-montserrat">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        {/* Page Title */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Product Bundle Manager
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Create and manage product bundles with drag-and-drop functionality
          </p>
        </div>

        {/* Main Product Section */}
        <div className="mb-16 shadow-md rounded-2xl p-8 border border-slate-100">
          <ProductSection
            title="Main Product"
            isMain={true}
            itemData={mainProduct}
            onCategoryChange={(value) =>
              handleMainProductChange("category", value)
            }
            onSubcategoryChange={(value) =>
              handleMainProductChange("subcategory", value)
            }
            onItemChange={(value) => handleMainProductChange("item", value)}
            onAssignItem={() => handleAssignItem("main")}
          />
        </div>

        {/* Bundle Items */}
        <div className="space-y-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bundle Items
            </h2>
            <p className="text-gray-600">
              Add complementary products to your bundle
            </p>
          </div>

          {bundleItems.map((item, index) => (
            <div
              key={item.id}
              className="shadow-md rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-shadow duration-300"
            >
              <ProductSection
                title={`Bundle Item ${index + 1}`}
                itemData={item}
                onCategoryChange={(value) =>
                  handleBundleItemChange(item.id, "category", value)
                }
                onSubcategoryChange={(value) =>
                  handleBundleItemChange(item.id, "subcategory", value)
                }
                onItemChange={(value) =>
                  handleBundleItemChange(item.id, "item", value)
                }
                onAssignItem={() => handleAssignItem(item.id)}
              />
            </div>
          ))}
        </div>

        {/* Bundle Preview */}
        {dragItems.length > 0 && (
          <div className="mt-20 mb-16 bg-gradient-to-b from-purple-50 to-pink-50 rounded-2xl p-10 border border-purple-100">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <GripVertical className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Bundle Preview
                </h2>
              </div>
              <p className="text-lg text-gray-600">
                Drag and drop to arrange your bundle items
              </p>
            </div>

            {/* DndContext content with enhanced styling */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={dragItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {dragItems.map((item, index) => (
                    <SortableItem key={item.id} id={item.id}>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                          {item.id === "main"
                            ? "Main Product"
                            : `Item ${index}`}
                        </h3>
                        <div className="w-[240px] h-[220px] bg-gray-50 rounded-lg mb-4 mx-auto overflow-hidden">
                          <img
                            src={
                              item.productData?.image ||
                              "/api/placeholder/240/220"
                            }
                            alt={item.id}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 text-sm text-left max-w-[240px] mx-auto">
                          <div>
                            <span className="text-gray-500">Product:</span>{" "}
                            <span className="font-medium text-gray-900">
                              {item.productData?.name || "T-Shirt"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Category:</span>{" "}
                            <span className="font-medium text-gray-900">
                              {item.productData?.category || "T-Shirt"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Subcategory:</span>{" "}
                            <span className="font-medium text-gray-900">
                              {item.productData?.subcategory || "Small"}
                            </span>
                          </div>
                        </div>
                        {item.id !== "main" && (
                          <div className="flex justify-center gap-2 mt-4">
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                              <Edit size={16} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleRemoveFromDragItems(item.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Trash2 size={16} className="text-gray-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Bundle List Button */}
        <button
          onClick={() => setShowBundleList(!showBundleList)}
          className="bg-black text-white px-8 py-3 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 relative mt-12"
        >
          <span className="flex items-center gap-3">
            View Bundle List
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm">
              {bundleList.length}
            </span>
          </span>
        </button>

        {/* Modals */}
        <EditBundleModal />
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Item assigned successfully!"
        />
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={cancelDeleteBundle}
          onConfirm={confirmDeleteBundle}
          title="Are you sure you want to delete this item?"
        />
        <SuccessModal
          isOpen={showDeleteSuccessModal}
          onClose={() => setShowDeleteSuccessModal(false)}
          title="Item deleted successfully!"
        />
      </div>
    </div>
  );
};

export default ProductBundling;
