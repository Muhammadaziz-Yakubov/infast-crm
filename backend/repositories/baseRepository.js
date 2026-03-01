class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll(filter = {}, options = {}) {
        const { sort = { createdAt: -1 }, page = 1, limit = 10, populate = '' } = options;
        const skip = (page - 1) * limit;

        const query = this.model.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate(populate);

        const data = await query.exec();
        const total = await this.model.countDocuments(filter);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async findOne(filter, populate = '') {
        return await this.model.findOne(filter).populate(populate).exec();
    }

    async findById(id, populate = '') {
        return await this.model.findById(id).populate(populate).exec();
    }

    async create(data) {
        const entity = new this.model(data);
        return await entity.save();
    }

    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        }).exec();
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id).exec();
    }

    async count(filter = {}) {
        return await this.model.countDocuments(filter);
    }
}

module.exports = BaseRepository;
