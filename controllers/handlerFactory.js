const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
// const filterObj = require('../utils/filterObject');

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    const filter = req.params.tourId ? { tour: req.params.tourId } : {};

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .paginate()
      .select();
    const documents = await features.query;

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        data: documents,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res) => {
    const query = Model.findById(req.params.id);
    if (populateOptions) query.populate(populateOptions);
    const document = await query;

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    // const body = fields.length > 0 ? filterObj(req.body, fields) : req.body;
    const document = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) return next(new AppError(404, 'Document not found'));

    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) return next(new AppError(404, 'Document not found'));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
