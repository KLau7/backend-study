class APIFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    const queryObj = { ...this.queryObj };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      '$$$1'
    );
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    const sortBy = this.queryObj.sort;
    if (sortBy) {
      this.query = this.query.sort(sortBy.split(',').join(' '));
    }

    return this;
  }

  select() {
    const { fields } = this.queryObj;
    if (fields) {
      this.query = this.query.select(fields.split(',').join(' '));
    }
    this.query = this.query.select('-__v');

    return this;
  }

  paginate() {
    const limit = this.queryObj.limit * 1 || 20;
    const pageNo = this.queryObj.page * 1 || 1;
    this.query = this.query.skip(limit * (pageNo - 1)).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
