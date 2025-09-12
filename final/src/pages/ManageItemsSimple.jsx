import React from "react";

const ManageItemsSimple = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Items</h1>
      <p>This is a simple version to test if the routing is working.</p>
      
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Test Dropdowns</h2>
        
        <div className="flex gap-4 mt-2">
          <select className="border p-2 rounded">
            <option>All categories</option>
            <option>Men</option>
            <option>Women</option>
          </select>
          
          <select className="border p-2 rounded">
            <option>All subcategories</option>
            <option>T-shirt</option>
            <option>Jeans</option>
          </select>
          
          <select className="border p-2 rounded">
            <option>Items</option>
            <option>Sample Item 1</option>
            <option>Sample Item 2</option>
          </select>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Test Checkboxes</h2>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Move to sale
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Make a copy and move to sale
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Move to eyx
          </label>
        </div>
      </div>
    </div>
  );
};

export default ManageItemsSimple;
