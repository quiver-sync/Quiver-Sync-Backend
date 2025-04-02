const Brand = require("../models/Brand");

exports.saveBrands = async (req, res) => {
    try {
      const brandData = req.body;
  
      // Convert to [{ name, models: [] }] structure and insert
      const formatted = Object.entries(brandData).map(([name, models]) => ({
        name,
        models,
      }));
      // Optional: clear existing brands first
      await Brand.deleteMany();
  
      await Brand.insertMany(formatted);
  
      res.status(201).json({ message: "Brands saved successfully!" });
    } catch (err) {
      console.error("Error saving brands:", err.message);
      res.status(500).json({ message: "Failed to save brands." });
    }
  };
  
  
  exports.getAllBrands = async (req, res) => {
    try {
      const brands = await Brand.find(); 
      res.status(200).json(brands); 
    } catch (error) {
      console.error("Failed to fetch brands:", error.message);
      res.status(500).json({ message: "Server error. Could not retrieve brands." });
    }
  };