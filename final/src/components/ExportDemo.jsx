import React from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportDemo = () => {
  const sampleData = [
    { metric: 'Total Revenue', value: '₹45,230', growth: '8.1%', trend: 'UP' },
    { metric: 'Page Views', value: '1,234', growth: '5.2%', trend: 'UP' },
    { metric: 'Visitors', value: '891', growth: '2.1%', trend: 'DOWN' },
    { metric: 'Conversion Rate', value: '3.2%', growth: '1.8%', trend: 'UP' }
  ];

  const handleTestExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Export Functionality Test Report', 20, 30);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      doc.text(`Generated at: ${new Date().toLocaleTimeString()}`, 20, 55);
      
      // Add test status
      doc.setFontSize(14);
      doc.text('Export Status: WORKING ✓', 20, 75);
      
      // Prepare table data
      const tableData = sampleData.map(item => [
        item.metric,
        item.value,
        item.growth,
        item.trend
      ]);
      
      // Add table
      doc.autoTable({
        startY: 85,
        head: [['Metric', 'Value', 'Growth', 'Trend']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255]
        }
      });
      
      // Save the PDF
      doc.save(`export-test-${new Date().toISOString().split('T')[0]}.pdf`);
      
      alert('PDF export test successful! Check your downloads folder.');
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('PDF export failed: ' + error.message);
    }
  };

  const handleTestExportExcel = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet from sample data
      const ws = XLSX.utils.json_to_sheet(sampleData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Export Test Data');
      
      // Create test info sheet
      const testInfo = [
        { field: 'Test Type', value: 'Excel Export Functionality' },
        { field: 'Date', value: new Date().toLocaleDateString() },
        { field: 'Time', value: new Date().toLocaleTimeString() },
        { field: 'Status', value: 'WORKING' },
        { field: 'Records', value: sampleData.length }
      ];
      
      const testInfoWS = XLSX.utils.json_to_sheet(testInfo);
      XLSX.utils.book_append_sheet(wb, testInfoWS, 'Test Info');
      
      // Write the file
      const fileName = `export-test-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      alert('Excel export test successful! Check your downloads folder.');
    } catch (error) {
      console.error('Excel Export Error:', error);
      alert('Excel export failed: ' + error.message);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Export Functionality Test
      </h2>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <strong>Test Purpose:</strong> Verify that PDF and Excel export functionality is working correctly.
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleTestExportPDF}
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Test PDF Export
          </button>
          
          <button 
            onClick={handleTestExportExcel}
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Test Excel Export
          </button>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          Click the buttons above to test the export functionality. Files will be downloaded to your default downloads folder.
        </div>
      </div>
    </div>
  );
};

export default ExportDemo;
