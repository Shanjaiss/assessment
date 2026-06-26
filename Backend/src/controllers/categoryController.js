const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorvalidation');

// @route  GET /api/categories
// @desc   List all categories created by the logged-in user (used by "Load Categories")
// @access Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ categories });
});

// @route  GET /api/categories/:id
// @access Private
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.status(200).json({ category });
});

// @route  POST /api/categories
// @desc   Create a new category in the reusable library (with optional factors/questions)
// @access Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, factors } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const category = await Category.create({
    name: name.trim(),
    factors: factors || [],
    createdBy: req.user._id,
  });

  res.status(201).json({ category });
});

// @route  PUT /api/categories/:id
// @desc   Update a category's name and/or its full factors/questions tree
// @access Private
const updateCategory = asyncHandler(async (req, res) => {
  const { name, factors } = req.body;

  const category = await Category.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({ message: 'Category name cannot be empty' });
    }
    category.name = name.trim();
  }

  if (factors !== undefined) {
    category.factors = factors;
  }

  await category.save();
  res.status(200).json({ category });
});

// @route  DELETE /api/categories/:id
// @access Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.status(200).json({ message: 'Category deleted successfully' });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
