const ErrorResponse = require('../utils/errorResponse');

class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAll(filter = {}, options = {}) {
        return await this.repository.findAll(filter, options);
    }

    async getById(id, populate = '') {
        const item = await this.repository.findById(id, populate);
        if (!item) {
            throw new ErrorResponse('Resurs topilmadi', 404);
        }
        return item;
    }

    async create(data) {
        return await this.repository.create(data);
    }

    async update(id, data) {
        const item = await this.repository.update(id, data);
        if (!item) {
            throw new ErrorResponse('Resurs topilmadi', 404);
        }
        return item;
    }

    async delete(id) {
        const item = await this.repository.delete(id);
        if (!item) {
            throw new ErrorResponse('Resurs topilmadi', 404);
        }
        return item;
    }
}

module.exports = BaseService;
