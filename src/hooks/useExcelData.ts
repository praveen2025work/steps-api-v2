import { useState, useEffect, useCallback } from 'react';

// Types for the Excel data structure
export interface ExcelSheet {
  name: string;
  data: string[][];
  maxCols: number;
}

export interface ExcelDataResponse {
  fileName: string;
  sheets: ExcelSheet[];
}

export interface UseExcelDataProps {
  location: string;
  name?: string | null;
  autoFetch?: boolean;
}

export interface UseExcelDataReturn {
  data: ExcelDataResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isEmptySheet: (sheet: ExcelSheet) => boolean;
  getNonEmptySheetCount: () => number;
}

// Mock data for development/testing
const mockExcelData: ExcelDataResponse = {
  fileName: "\\\\Intranet.barcapint.com\\DFS-EMEA\\GROUP\\Ldn\\Risk\\PCon\\GCD\\EUROPE\\FAS\\UAT\\FICREDITGCFSASIA\\2025-06-27\\",
  sheets: [
    {
      name: "Closed Expired books",
      data: [["NO DATA FOUND", null]],
      maxCols: 2
    },
    {
      name: "Non Risk books",
      data: [
        ["Reporting Date", "NPL Name", "L7", "L8", "L11 Master Book ID", "L11 Master Book", "Status", "Amount", "Currency", "Region", "Risk Level", "Maturity Date", "Credit Rating", "Exposure", "Collateral", "Recovery Rate", "PD", "LGD", "EAD", "RWA", "Capital", "Profit", "ROE", "RAROC"],
        ["2025-01-15", "Book Alpha", "Level7A", "Level8A", "MB001", "Master Book Alpha", "Active", "1000000", "USD", "EMEA", "Low", "2025-12-31", "AA", "950000", "1200000", "0.85", "0.02", "0.45", "900000", "180000", "36000", "120000", "0.15", "0.12"],
        ["2025-01-15", "Book Beta", "Level7B", "Level8B", "MB002", "Master Book Beta", "Active", "2500000", "EUR", "APAC", "Medium", "2026-06-30", "A", "2300000", "2800000", "0.75", "0.05", "0.55", "2200000", "440000", "88000", "280000", "0.18", "0.14"],
        ["2025-01-15", "Book Gamma", "Level7C", "Level8C", "MB003", "Master Book Gamma", "Inactive", "750000", "GBP", "AMERICAS", "High", "2025-03-31", "BBB", "700000", "600000", "0.60", "0.08", "0.65", "650000", "130000", "26000", "85000", "0.12", "0.08"],
        ["2025-01-16", "Book Delta", "Level7D", "Level8D", "MB004", "Master Book Delta", "Active", "3200000", "USD", "EMEA", "Low", "2027-01-15", "AAA", "3100000", "3500000", "0.90", "0.01", "0.40", "2900000", "580000", "116000", "380000", "0.20", "0.16"],
        ["2025-01-16", "Book Epsilon", "Level7E", "Level8E", "MB005", "Master Book Epsilon", "Active", "1800000", "EUR", "APAC", "Medium", "2025-09-30", "A-", "1750000", "2000000", "0.80", "0.04", "0.50", "1650000", "330000", "66000", "210000", "0.16", "0.13"],
        ["2025-01-17", "Book Zeta", "Level7F", "Level8F", "MB006", "Master Book Zeta", "Under Review", "4500000", "USD", "AMERICAS", "Medium", "2026-12-31", "A+", "4200000", "5000000", "0.85", "0.03", "0.48", "4000000", "800000", "160000", "520000", "0.19", "0.15"],
        ["2025-01-17", "Book Eta", "Level7G", "Level8G", "MB007", "Master Book Eta", "Active", "950000", "GBP", "EMEA", "Low", "2025-11-30", "AA-", "920000", "1100000", "0.88", "0.02", "0.42", "880000", "176000", "35200", "115000", "0.17", "0.13"],
        ["2025-01-18", "Book Theta", "Level7H", "Level8H", "MB008", "Master Book Theta", "Pending", "2200000", "EUR", "APAC", "High", "2025-05-31", "BB+", "2000000", "1800000", "0.65", "0.12", "0.70", "1900000", "380000", "76000", "240000", "0.11", "0.07"],
        ["2025-01-18", "Book Iota", "Level7I", "Level8I", "MB009", "Master Book Iota", "Active", "1650000", "USD", "AMERICAS", "Medium", "2026-08-31", "A", "1600000", "1900000", "0.78", "0.05", "0.52", "1500000", "300000", "60000", "195000", "0.16", "0.12"]
      ],
      maxCols: 24
    },
    {
      name: "Impairment books",
      data: [["NO DATA FOUND", null]],
      maxCols: 2
    },
    {
      name: "Default books",
      data: [["NO DATA FOUND", null]],
      maxCols: 2
    },
    {
      name: "Cost Center books",
      data: [
        ["Cost Center", "Department", "Budget", "Actual", "Variance", "Variance %", "Manager", "Last Updated"],
        ["CC001", "Risk Management", "500000", "485000", "-15000", "-3.0%", "John Smith", "2025-01-15"],
        ["CC002", "Operations", "750000", "720000", "-30000", "-4.0%", "Jane Doe", "2025-01-16"],
        ["CC003", "Technology", "1200000", "1250000", "50000", "4.2%", "Bob Johnson", "2025-01-17"],
        ["CC004", "Compliance", "300000", "295000", "-5000", "-1.7%", "Alice Brown", "2025-01-18"],
        ["CC005", "Finance", "450000", "460000", "10000", "2.2%", "Charlie Wilson", "2025-01-19"]
      ],
      maxCols: 8
    },
    {
      name: "Central books",
      data: [["NO DATA FOUND", null]],
      maxCols: 2
    }
  ]
};

export const useExcelData = ({ 
  location, 
  name = null, 
  autoFetch = true 
}: UseExcelDataProps): UseExcelDataReturn => {
  const [data, setData] = useState<ExcelDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a sheet has no data
  const isEmptySheet = useCallback((sheet: ExcelSheet): boolean => {
    return sheet.data.length === 1 && 
           sheet.data[0].length <= 2 && 
           (sheet.data[0][0] === "NO DATA FOUND" || sheet.data[0][0] === null);
  }, []);

  // Get non-empty sheets count
  const getNonEmptySheetCount = useCallback((): number => {
    if (!data) return 0;
    return data.sheets.filter(sheet => !isEmptySheet(sheet)).length;
  }, [data, isEmptySheet]);

  // Fetch data from the Java API
  const fetchExcelData = useCallback(async () => {
    if (!location) {
      setError('Location parameter is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://api-java.com/api/process/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          name: name
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ExcelDataResponse = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching Excel data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      
      // Use mock data in case of error for development
      console.log('Using mock data for development');
      setData(mockExcelData);
    } finally {
      setLoading(false);
    }
  }, [location, name]);

  useEffect(() => {
    if (autoFetch) {
      fetchExcelData();
    }
  }, [fetchExcelData, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchExcelData,
    isEmptySheet,
    getNonEmptySheetCount
  };
};