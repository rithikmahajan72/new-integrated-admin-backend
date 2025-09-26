import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
  Eye,
  Save
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { itemAPI } from '../api/endpoints';

const ItemManagementBulkUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedProducts, setUploadedProducts] = useState([]);

  // Excel template structure matching the single product upload
  const expectedColumns = [
    'Product Name',
    'Title',
    'Description',
    'Manufacturing Details',
    'Shipping Returns',
    'Size Name',
    'Quantity',
    'HSN Code',
    'SKU',
    'Barcode Number',
    'Regular Price',
    'Sale Price',
    'Waist (CM)',
    'Inseam (CM)',
    'Chest (CM)',
    'Front Length (CM)',
    'Across Shoulder (CM)',
    'Waist (IN)',
    'Inseam (IN)',
    'Chest (IN)',
    'Front Length (IN)',
    'Across Shoulder (IN)',
    'Meta Title',
    'Meta Description',
    'Slug URL'
  ];

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError(null);
        parseExcelFile(file);
      } else {
        setError('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  // Parse Excel file
  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setError('Excel file is empty');
          return;
        }

        // Validate columns
        const fileColumns = Object.keys(jsonData[0]);
        const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));
        
        if (missingColumns.length > 0) {
          setError(`Missing columns: ${missingColumns.join(', ')}`);
          return;
        }

        // Group data by product name (multiple rows for different sizes)
        const groupedProducts = groupDataByProduct(jsonData);
        setParsedData(groupedProducts);
        validateData(groupedProducts);
        
      } catch (err) {
        setError('Error parsing Excel file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Group data by product name
  const groupDataByProduct = (data) => {
    const grouped = {};
    
    data.forEach((row, index) => {
      const productName = row['Product Name'];
      if (!productName) return;
      
      if (!grouped[productName]) {
        grouped[productName] = {
          rowIndex: index,
          productName: row['Product Name'],
          title: row['Title'],
          description: row['Description'],
          manufacturingDetails: row['Manufacturing Details'],
          shippingReturns: row['Shipping Returns'],
          sizes: []
        };
      }
      
      // Add size data if size name exists
      if (row['Size Name']) {
        grouped[productName].sizes.push({
          sizeName: row['Size Name'],
          quantity: parseInt(row['Quantity']) || 0,
          hsn: row['HSN Code'],
          sku: row['SKU'],
          barcodeNo: row['Barcode Number'],
          regularPrice: parseFloat(row['Regular Price']) || 0,
          salePrice: parseFloat(row['Sale Price']) || 0,
          waistCm: row['Waist (CM)'],
          inseamCm: row['Inseam (CM)'],
          chestCm: row['Chest (CM)'],
          frontLengthCm: row['Front Length (CM)'],
          acrossShoulderCm: row['Across Shoulder (CM)'],
          waistIn: row['Waist (IN)'],
          inseamIn: row['Inseam (IN)'],
          chestIn: row['Chest (IN)'],
          frontLengthIn: row['Front Length (IN)'],
          acrossShoulderIn: row['Across Shoulder (IN)'],
          metaTitle: row['Meta Title'],
          metaDescription: row['Meta Description'],
          slugUrl: row['Slug URL']
        });
      }
    });
    
    return Object.values(grouped);
  };

  // Validate parsed data
  const validateData = (products) => {
    const errors = {};
    
    products.forEach((product, index) => {
      const productErrors = [];
      
      if (!product.productName?.trim()) {
        productErrors.push('Product name is required');
      }
      
      if (!product.description?.trim()) {
        productErrors.push('Description is required');
      }
      
      if (product.sizes.length === 0) {
        productErrors.push('At least one size variant is required');
      }
      
      product.sizes.forEach((size, sizeIndex) => {
        if (!size.sizeName?.trim()) {
          productErrors.push(`Size ${sizeIndex + 1}: Size name is required`);
        }
        if (size.quantity < 0) {
          productErrors.push(`Size ${sizeIndex + 1}: Quantity cannot be negative`);
        }
        if (size.regularPrice <= 0) {
          productErrors.push(`Size ${sizeIndex + 1}: Regular price must be greater than 0`);
        }
      });
      
      if (productErrors.length > 0) {
        errors[index] = productErrors;
      }
    });
    
    setValidationErrors(errors);
  };

  // Download Excel template
  const downloadTemplate = () => {
    const templateData = [
      // Product 1: Premium Cotton T-Shirt - Multiple Sizes
      {
        'Product Name': 'Premium Cotton T-Shirt',
        'Title': 'Premium Cotton T-Shirt - Casual Wear',
        'Description': 'High quality 100% cotton t-shirt with comfortable fit. Perfect for daily wear and casual outings.',
        'Manufacturing Details': 'Made from 100% organic cotton, pre-shrunk, tagless design',
        'Shipping Returns': 'Free shipping on orders above ₹499, 30-day easy returns',
        'Size Name': 'XS',
        'Quantity': '25',
        'HSN Code': '61091000',
        'SKU': 'TSHIRT-COTTON-XS-001',
        'Barcode Number': '1234567890101',
        'Regular Price': '899',
        'Sale Price': '699',
        'Waist (CM)': '68',
        'Inseam (CM)': '70',
        'Chest (CM)': '88',
        'Front Length (CM)': '63',
        'Across Shoulder (CM)': '38',
        'Waist (IN)': '27',
        'Inseam (IN)': '28',
        'Chest (IN)': '35',
        'Front Length (IN)': '25',
        'Across Shoulder (IN)': '15',
        'Meta Title': 'Premium Cotton T-Shirt XS - Comfortable Casual Wear',
        'Meta Description': 'Buy premium quality cotton t-shirt in XS size. Comfortable fit, organic cotton material.',
        'Slug URL': 'premium-cotton-tshirt-xs'
      },
      {
        'Product Name': 'Premium Cotton T-Shirt',
        'Title': 'Premium Cotton T-Shirt - Casual Wear',
        'Description': 'High quality 100% cotton t-shirt with comfortable fit. Perfect for daily wear and casual outings.',
        'Manufacturing Details': 'Made from 100% organic cotton, pre-shrunk, tagless design',
        'Shipping Returns': 'Free shipping on orders above ₹499, 30-day easy returns',
        'Size Name': 'S',
        'Quantity': '35',
        'HSN Code': '61091000',
        'SKU': 'TSHIRT-COTTON-S-001',
        'Barcode Number': '1234567890102',
        'Regular Price': '899',
        'Sale Price': '699',
        'Waist (CM)': '72',
        'Inseam (CM)': '75',
        'Chest (CM)': '92',
        'Front Length (CM)': '65',
        'Across Shoulder (CM)': '40',
        'Waist (IN)': '28',
        'Inseam (IN)': '30',
        'Chest (IN)': '36',
        'Front Length (IN)': '26',
        'Across Shoulder (IN)': '16',
        'Meta Title': 'Premium Cotton T-Shirt S - Comfortable Casual Wear',
        'Meta Description': 'Buy premium quality cotton t-shirt in S size. Comfortable fit, organic cotton material.',
        'Slug URL': 'premium-cotton-tshirt-s'
      },
      {
        'Product Name': 'Premium Cotton T-Shirt',
        'Title': 'Premium Cotton T-Shirt - Casual Wear',
        'Description': 'High quality 100% cotton t-shirt with comfortable fit. Perfect for daily wear and casual outings.',
        'Manufacturing Details': 'Made from 100% organic cotton, pre-shrunk, tagless design',
        'Shipping Returns': 'Free shipping on orders above ₹499, 30-day easy returns',
        'Size Name': 'M',
        'Quantity': '50',
        'HSN Code': '61091000',
        'SKU': 'TSHIRT-COTTON-M-001',
        'Barcode Number': '1234567890103',
        'Regular Price': '899',
        'Sale Price': '699',
        'Waist (CM)': '76',
        'Inseam (CM)': '76',
        'Chest (CM)': '96',
        'Front Length (CM)': '67',
        'Across Shoulder (CM)': '42',
        'Waist (IN)': '30',
        'Inseam (IN)': '30',
        'Chest (IN)': '38',
        'Front Length (IN)': '26',
        'Across Shoulder (IN)': '17',
        'Meta Title': 'Premium Cotton T-Shirt M - Comfortable Casual Wear',
        'Meta Description': 'Buy premium quality cotton t-shirt in M size. Comfortable fit, organic cotton material.',
        'Slug URL': 'premium-cotton-tshirt-m'
      },
      {
        'Product Name': 'Premium Cotton T-Shirt',
        'Title': 'Premium Cotton T-Shirt - Casual Wear',
        'Description': 'High quality 100% cotton t-shirt with comfortable fit. Perfect for daily wear and casual outings.',
        'Manufacturing Details': 'Made from 100% organic cotton, pre-shrunk, tagless design',
        'Shipping Returns': 'Free shipping on orders above ₹499, 30-day easy returns',
        'Size Name': 'L',
        'Quantity': '45',
        'HSN Code': '61091000',
        'SKU': 'TSHIRT-COTTON-L-001',
        'Barcode Number': '1234567890104',
        'Regular Price': '899',
        'Sale Price': '699',
        'Waist (CM)': '80',
        'Inseam (CM)': '78',
        'Chest (CM)': '100',
        'Front Length (CM)': '69',
        'Across Shoulder (CM)': '44',
        'Waist (IN)': '32',
        'Inseam (IN)': '31',
        'Chest (IN)': '40',
        'Front Length (IN)': '27',
        'Across Shoulder (IN)': '17',
        'Meta Title': 'Premium Cotton T-Shirt L - Comfortable Casual Wear',
        'Meta Description': 'Buy premium quality cotton t-shirt in L size. Comfortable fit, organic cotton material.',
        'Slug URL': 'premium-cotton-tshirt-l'
      },
      {
        'Product Name': 'Premium Cotton T-Shirt',
        'Title': 'Premium Cotton T-Shirt - Casual Wear',
        'Description': 'High quality 100% cotton t-shirt with comfortable fit. Perfect for daily wear and casual outings.',
        'Manufacturing Details': 'Made from 100% organic cotton, pre-shrunk, tagless design',
        'Shipping Returns': 'Free shipping on orders above ₹499, 30-day easy returns',
        'Size Name': 'XL',
        'Quantity': '40',
        'HSN Code': '61091000',
        'SKU': 'TSHIRT-COTTON-XL-001',
        'Barcode Number': '1234567890105',
        'Regular Price': '899',
        'Sale Price': '699',
        'Waist (CM)': '84',
        'Inseam (CM)': '80',
        'Chest (CM)': '104',
        'Front Length (CM)': '71',
        'Across Shoulder (CM)': '46',
        'Waist (IN)': '33',
        'Inseam (IN)': '32',
        'Chest (IN)': '41',
        'Front Length (IN)': '28',
        'Across Shoulder (IN)': '18',
        'Meta Title': 'Premium Cotton T-Shirt XL - Comfortable Casual Wear',
        'Meta Description': 'Buy premium quality cotton t-shirt in XL size. Comfortable fit, organic cotton material.',
        'Slug URL': 'premium-cotton-tshirt-xl'
      },
      
      // Product 2: Slim Fit Jeans - Multiple Sizes
      {
        'Product Name': 'Slim Fit Denim Jeans',
        'Title': 'Slim Fit Dark Blue Denim Jeans',
        'Description': 'Stylish slim fit jeans made from premium denim fabric. Perfect for casual and semi-formal occasions.',
        'Manufacturing Details': '98% cotton, 2% elastane blend for comfort and durability',
        'Shipping Returns': 'Free shipping on orders above ₹999, 15-day exchange policy',
        'Size Name': '28',
        'Quantity': '20',
        'HSN Code': '62034200',
        'SKU': 'JEANS-SLIM-28-002',
        'Barcode Number': '2345678901201',
        'Regular Price': '1899',
        'Sale Price': '1499',
        'Waist (CM)': '71',
        'Inseam (CM)': '82',
        'Chest (CM)': '0',
        'Front Length (CM)': '102',
        'Across Shoulder (CM)': '0',
        'Waist (IN)': '28',
        'Inseam (IN)': '32',
        'Chest (IN)': '0',
        'Front Length (IN)': '40',
        'Across Shoulder (IN)': '0',
        'Meta Title': 'Slim Fit Denim Jeans Size 28 - Dark Blue Premium Quality',
        'Meta Description': 'Buy slim fit denim jeans in size 28. Premium quality fabric with comfortable stretch.',
        'Slug URL': 'slim-fit-denim-jeans-28'
      },
      {
        'Product Name': 'Slim Fit Denim Jeans',
        'Title': 'Slim Fit Dark Blue Denim Jeans',
        'Description': 'Stylish slim fit jeans made from premium denim fabric. Perfect for casual and semi-formal occasions.',
        'Manufacturing Details': '98% cotton, 2% elastane blend for comfort and durability',
        'Shipping Returns': 'Free shipping on orders above ₹999, 15-day exchange policy',
        'Size Name': '30',
        'Quantity': '30',
        'HSN Code': '62034200',
        'SKU': 'JEANS-SLIM-30-002',
        'Barcode Number': '2345678901202',
        'Regular Price': '1899',
        'Sale Price': '1499',
        'Waist (CM)': '76',
        'Inseam (CM)': '84',
        'Chest (CM)': '0',
        'Front Length (CM)': '104',
        'Across Shoulder (CM)': '0',
        'Waist (IN)': '30',
        'Inseam (IN)': '33',
        'Chest (IN)': '0',
        'Front Length (IN)': '41',
        'Across Shoulder (IN)': '0',
        'Meta Title': 'Slim Fit Denim Jeans Size 30 - Dark Blue Premium Quality',
        'Meta Description': 'Buy slim fit denim jeans in size 30. Premium quality fabric with comfortable stretch.',
        'Slug URL': 'slim-fit-denim-jeans-30'
      },
      {
        'Product Name': 'Slim Fit Denim Jeans',
        'Title': 'Slim Fit Dark Blue Denim Jeans',
        'Description': 'Stylish slim fit jeans made from premium denim fabric. Perfect for casual and semi-formal occasions.',
        'Manufacturing Details': '98% cotton, 2% elastane blend for comfort and durability',
        'Shipping Returns': 'Free shipping on orders above ₹999, 15-day exchange policy',
        'Size Name': '32',
        'Quantity': '35',
        'HSN Code': '62034200',
        'SKU': 'JEANS-SLIM-32-002',
        'Barcode Number': '2345678901203',
        'Regular Price': '1899',
        'Sale Price': '1499',
        'Waist (CM)': '81',
        'Inseam (CM)': '86',
        'Chest (CM)': '0',
        'Front Length (CM)': '106',
        'Across Shoulder (CM)': '0',
        'Waist (IN)': '32',
        'Inseam (IN)': '34',
        'Chest (IN)': '0',
        'Front Length (IN)': '42',
        'Across Shoulder (IN)': '0',
        'Meta Title': 'Slim Fit Denim Jeans Size 32 - Dark Blue Premium Quality',
        'Meta Description': 'Buy slim fit denim jeans in size 32. Premium quality fabric with comfortable stretch.',
        'Slug URL': 'slim-fit-denim-jeans-32'
      },
      {
        'Product Name': 'Slim Fit Denim Jeans',
        'Title': 'Slim Fit Dark Blue Denim Jeans',
        'Description': 'Stylish slim fit jeans made from premium denim fabric. Perfect for casual and semi-formal occasions.',
        'Manufacturing Details': '98% cotton, 2% elastane blend for comfort and durability',
        'Shipping Returns': 'Free shipping on orders above ₹999, 15-day exchange policy',
        'Size Name': '34',
        'Quantity': '25',
        'HSN Code': '62034200',
        'SKU': 'JEANS-SLIM-34-002',
        'Barcode Number': '2345678901204',
        'Regular Price': '1899',
        'Sale Price': '1499',
        'Waist (CM)': '86',
        'Inseam (CM)': '88',
        'Chest (CM)': '0',
        'Front Length (CM)': '108',
        'Across Shoulder (CM)': '0',
        'Waist (IN)': '34',
        'Inseam (IN)': '35',
        'Chest (IN)': '0',
        'Front Length (IN)': '43',
        'Across Shoulder (IN)': '0',
        'Meta Title': 'Slim Fit Denim Jeans Size 34 - Dark Blue Premium Quality',
        'Meta Description': 'Buy slim fit denim jeans in size 34. Premium quality fabric with comfortable stretch.',
        'Slug URL': 'slim-fit-denim-jeans-34'
      },

      // Product 3: Formal Shirt - Multiple Sizes
      {
        'Product Name': 'Classic Formal Shirt',
        'Title': 'Classic White Formal Shirt - Business Wear',
        'Description': 'Crisp white formal shirt perfect for office wear and business meetings. Made from premium cotton fabric.',
        'Manufacturing Details': '100% cotton, wrinkle-resistant finish, easy care',
        'Shipping Returns': 'Free shipping on orders above ₹799, 30-day returns',
        'Size Name': 'S',
        'Quantity': '30',
        'HSN Code': '62052000',
        'SKU': 'SHIRT-FORMAL-S-003',
        'Barcode Number': '3456789012301',
        'Regular Price': '1299',
        'Sale Price': '999',
        'Waist (CM)': '94',
        'Inseam (CM)': '0',
        'Chest (CM)': '96',
        'Front Length (CM)': '76',
        'Across Shoulder (CM)': '43',
        'Waist (IN)': '37',
        'Inseam (IN)': '0',
        'Chest (IN)': '38',
        'Front Length (IN)': '30',
        'Across Shoulder (IN)': '17',
        'Meta Title': 'Classic White Formal Shirt Size S - Business Professional',
        'Meta Description': 'Buy classic white formal shirt in S size. Perfect for office wear and business meetings.',
        'Slug URL': 'classic-formal-shirt-white-s'
      },
      {
        'Product Name': 'Classic Formal Shirt',
        'Title': 'Classic White Formal Shirt - Business Wear',
        'Description': 'Crisp white formal shirt perfect for office wear and business meetings. Made from premium cotton fabric.',
        'Manufacturing Details': '100% cotton, wrinkle-resistant finish, easy care',
        'Shipping Returns': 'Free shipping on orders above ₹799, 30-day returns',
        'Size Name': 'M',
        'Quantity': '40',
        'HSN Code': '62052000',
        'SKU': 'SHIRT-FORMAL-M-003',
        'Barcode Number': '3456789012302',
        'Regular Price': '1299',
        'Sale Price': '999',
        'Waist (CM)': '98',
        'Inseam (CM)': '0',
        'Chest (CM)': '100',
        'Front Length (CM)': '78',
        'Across Shoulder (CM)': '45',
        'Waist (IN)': '39',
        'Inseam (IN)': '0',
        'Chest (IN)': '39',
        'Front Length (IN)': '31',
        'Across Shoulder (IN)': '18',
        'Meta Title': 'Classic White Formal Shirt Size M - Business Professional',
        'Meta Description': 'Buy classic white formal shirt in M size. Perfect for office wear and business meetings.',
        'Slug URL': 'classic-formal-shirt-white-m'
      },
      {
        'Product Name': 'Classic Formal Shirt',
        'Title': 'Classic White Formal Shirt - Business Wear',
        'Description': 'Crisp white formal shirt perfect for office wear and business meetings. Made from premium cotton fabric.',
        'Manufacturing Details': '100% cotton, wrinkle-resistant finish, easy care',
        'Shipping Returns': 'Free shipping on orders above ₹799, 30-day returns',
        'Size Name': 'L',
        'Quantity': '35',
        'HSN Code': '62052000',
        'SKU': 'SHIRT-FORMAL-L-003',
        'Barcode Number': '3456789012303',
        'Regular Price': '1299',
        'Sale Price': '999',
        'Waist (CM)': '102',
        'Inseam (CM)': '0',
        'Chest (CM)': '104',
        'Front Length (CM)': '80',
        'Across Shoulder (CM)': '47',
        'Waist (IN)': '40',
        'Inseam (IN)': '0',
        'Chest (IN)': '41',
        'Front Length (IN)': '32',
        'Across Shoulder (IN)': '19',
        'Meta Title': 'Classic White Formal Shirt Size L - Business Professional',
        'Meta Description': 'Buy classic white formal shirt in L size. Perfect for office wear and business meetings.',
        'Slug URL': 'classic-formal-shirt-white-l'
      },

      // Product 4: Casual Hoodie - Multiple Sizes
      {
        'Product Name': 'Comfortable Cotton Hoodie',
        'Title': 'Comfortable Cotton Hoodie - Street Wear',
        'Description': 'Cozy cotton hoodie perfect for casual outings and lounging. Features adjustable hood and kangaroo pocket.',
        'Manufacturing Details': '80% cotton, 20% polyester blend, fleece lined interior',
        'Shipping Returns': 'Free shipping on orders above ₹1199, 30-day returns',
        'Size Name': 'M',
        'Quantity': '25',
        'HSN Code': '61102000',
        'SKU': 'HOODIE-COTTON-M-004',
        'Barcode Number': '4567890123401',
        'Regular Price': '1799',
        'Sale Price': '1399',
        'Waist (CM)': '100',
        'Inseam (CM)': '0',
        'Chest (CM)': '108',
        'Front Length (CM)': '68',
        'Across Shoulder (CM)': '50',
        'Waist (IN)': '39',
        'Inseam (IN)': '0',
        'Chest (IN)': '43',
        'Front Length (IN)': '27',
        'Across Shoulder (IN)': '20',
        'Meta Title': 'Comfortable Cotton Hoodie Size M - Casual Street Wear',
        'Meta Description': 'Buy comfortable cotton hoodie in M size. Perfect for casual wear with fleece lined comfort.',
        'Slug URL': 'comfortable-cotton-hoodie-m'
      },
      {
        'Product Name': 'Comfortable Cotton Hoodie',
        'Title': 'Comfortable Cotton Hoodie - Street Wear',
        'Description': 'Cozy cotton hoodie perfect for casual outings and lounging. Features adjustable hood and kangaroo pocket.',
        'Manufacturing Details': '80% cotton, 20% polyester blend, fleece lined interior',
        'Shipping Returns': 'Free shipping on orders above ₹1199, 30-day returns',
        'Size Name': 'L',
        'Quantity': '30',
        'HSN Code': '61102000',
        'SKU': 'HOODIE-COTTON-L-004',
        'Barcode Number': '4567890123402',
        'Regular Price': '1799',
        'Sale Price': '1399',
        'Waist (CM)': '104',
        'Inseam (CM)': '0',
        'Chest (CM)': '112',
        'Front Length (CM)': '70',
        'Across Shoulder (CM)': '52',
        'Waist (IN)': '41',
        'Inseam (IN)': '0',
        'Chest (IN)': '44',
        'Front Length (IN)': '28',
        'Across Shoulder (IN)': '21',
        'Meta Title': 'Comfortable Cotton Hoodie Size L - Casual Street Wear',
        'Meta Description': 'Buy comfortable cotton hoodie in L size. Perfect for casual wear with fleece lined comfort.',
        'Slug URL': 'comfortable-cotton-hoodie-l'
      },
      {
        'Product Name': 'Comfortable Cotton Hoodie',
        'Title': 'Comfortable Cotton Hoodie - Street Wear',
        'Description': 'Cozy cotton hoodie perfect for casual outings and lounging. Features adjustable hood and kangaroo pocket.',
        'Manufacturing Details': '80% cotton, 20% polyester blend, fleece lined interior',
        'Shipping Returns': 'Free shipping on orders above ₹1199, 30-day returns',
        'Size Name': 'XL',
        'Quantity': '20',
        'HSN Code': '61102000',
        'SKU': 'HOODIE-COTTON-XL-004',
        'Barcode Number': '4567890123403',
        'Regular Price': '1799',
        'Sale Price': '1399',
        'Waist (CM)': '108',
        'Inseam (CM)': '0',
        'Chest (CM)': '116',
        'Front Length (CM)': '72',
        'Across Shoulder (CM)': '54',
        'Waist (IN)': '43',
        'Inseam (IN)': '0',
        'Chest (IN)': '46',
        'Front Length (IN)': '28',
        'Across Shoulder (IN)': '21',
        'Meta Title': 'Comfortable Cotton Hoodie Size XL - Casual Street Wear',
        'Meta Description': 'Buy comfortable cotton hoodie in XL size. Perfect for casual wear with fleece lined comfort.',
        'Slug URL': 'comfortable-cotton-hoodie-xl'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'bulk_upload_template.xlsx');
  };

  // Upload products to API
  const handleBulkUpload = async () => {
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix validation errors before uploading');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
    
    const results = [];
    const total = parsedData.length;

    try {
      for (let i = 0; i < parsedData.length; i++) {
        const product = parsedData[i];
        
        // Prepare product data for API
        const productData = {
          productName: product.productName,
          title: product.title,
          description: product.description,
          manufacturingDetails: product.manufacturingDetails,
          shippingAndReturns: product.shippingReturns,
          sizes: product.sizes.map(size => ({
            size: size.sizeName, // Map sizeName to size
            quantity: size.quantity,
            hsnCode: size.hsn, // Map hsn to hsnCode
            sku: size.sku,
            barcode: size.barcodeNo, // Map barcodeNo to barcode
            regularPrice: size.regularPrice,
            salePrice: size.salePrice,
            fitWaistCm: size.waistCm, // Map waistCm to fitWaistCm
            inseamLengthCm: size.inseamCm, // Map inseamCm to inseamLengthCm
            chestCm: size.chestCm,
            frontLengthCm: size.frontLengthCm,
            acrossShoulderCm: size.acrossShoulderCm,
            toFitWaistIn: size.waistIn, // Map waistIn to toFitWaistIn
            inseamLengthIn: size.inseamIn, // Map inseamIn to inseamLengthIn
            chestIn: size.chestIn,
            frontLengthIn: size.frontLengthIn,
            acrossShoulderIn: size.acrossShoulderIn,
            metaTitle: size.metaTitle,
            metaDescription: size.metaDescription,
            slugUrl: size.slugUrl
          })),
          status: 'draft', // Save as draft for later completion
          pendingImageUpload: true, // Flag to indicate images/videos needed
          pendingCategoryAssignment: true // Flag to indicate category assignment needed
        };

        try {
          // Use the correct endpoint for Phase 1: Basic Product Creation
          const response = await itemAPI.createBasicProduct(productData);
          results.push({
            product: product.productName,
            success: true,
            id: response.data.data?.id || response.data.data?._id || response.data.id,
            message: 'Product created successfully as draft'
          });
        } catch (apiError) {
          results.push({
            product: product.productName,
            success: false,
            error: apiError.response?.data?.message || apiError.message
          });
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      setUploadedProducts(results);
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      setSuccess(`Upload completed! ${successCount} products created successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`);
      
    } catch (error) {
      setError('Bulk upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear all data
  const handleClear = () => {
    setSelectedFile(null);
    setParsedData([]);
    setValidationErrors({});
    setUploadedProducts([]);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/item-management')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bulk Product Upload</h1>
                <p className="text-gray-600 mt-1">Upload multiple products via Excel file</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">How to use Bulk Upload</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Download the Excel template using the button below</li>
            <li>Fill in your product data following the template format</li>
            <li>Upload the completed Excel file</li>
            <li>Review the parsed data and fix any validation errors</li>
            <li>Click "Upload Products" to save them as drafts</li>
            <li>Products will be saved with pending status for images/videos and category assignment</li>
          </ol>
        </div>

        {/* Template Download and File Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Template
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Select Excel File
              </button>
            </div>

            {parsedData.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Clear All
              </button>
            )}
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected file: <span className="font-medium">{selectedFile.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">Uploading products... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Parsed Data Preview */}
        {parsedData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Parsed Products ({parsedData.length})
              </h2>
              
              {Object.keys(validationErrors).length === 0 ? (
                <button
                  onClick={handleBulkUpload}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Upload Products
                </button>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>Fix errors before uploading</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {parsedData.map((product, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${
                    validationErrors[index] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{product.productName}</h3>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.sizes.length} size variant{product.sizes.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {validationErrors[index] ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Has errors</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Valid</span>
                      </div>
                    )}
                  </div>

                  {/* Validation Errors */}
                  {validationErrors[index] && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {validationErrors[index].map((error, errorIndex) => (
                          <li key={errorIndex}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Size variants preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {product.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="text-sm bg-gray-100 rounded p-2">
                        <span className="font-medium">{size.sizeName}</span> - 
                        Qty: {size.quantity}, Price: ₹{size.regularPrice}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Results */}
        {uploadedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Results</h2>
            <div className="space-y-3">
              {uploadedProducts.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">{result.product}</span>
                  </div>
                  
                  <div className="text-sm">
                    {result.success ? (
                      <span className="text-green-700">{result.message}</span>
                    ) : (
                      <span className="text-red-700">{result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate('/item-management')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-5 h-5" />
                View All Products
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload More Products
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemManagementBulkUpload;
