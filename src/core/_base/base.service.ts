import { ClientSession, Document } from 'mongoose';
import _ from 'lodash';
import { Utils } from '../utils';
import { AppResponse, Pagination, QueryParser } from '../common';
import { AppException } from '../expections';
import { ResponseOption } from '../interfaces';

/**
 * The BaseService class
 * */
export class BaseService<T extends Document> {
  public routes = {
    create: true,
    findOne: true,
    find: true,
    update: true,
    patch: true,
    remove: true,
  };
  public readonly modelName: string;
  public baseUrl = `localhost:${process.env.PORT || 4003}`;
  public itemsPerPage = 10;
  public entity: any | T;

  public defaultConfig: any = {
    config: () => {
      return {
        idToken: Utils.generateCode(4, true),
        softDelete: true,
        uniques: [],
        returnDuplicate: false,
        fillables: [],
        updateFillables: [],
        hiddenFields: ['deleted'],
      };
    },
  };

  constructor(protected readonly model: any | T | Document) {
    this.modelName = model.collection.collectionName;
    this.entity = model;
    if (!this.entity.config) {
      this.entity.config = this.defaultConfig.config;
    }
  }

  public get Model() {
    return this.model;
  }

  /**
   * @param {Object} obj required for response
   * @return {Object}
   * */
  async validateCreate(obj: any): Promise<any | T> {
    return null;
  }

  /**
   * @param {Object} obj required for response
   * @return {Object}
   * */
  async validateDelete(obj: any): Promise<any | T> {
    return null;
  }

  /**
   * @param {Object} current required for response
   * @param {Object} obj required for response
   * @return {Object}
   * */
  async validateUpdate(current, obj: any): Promise<any | T> {
    return null;
  }

  /**
   * @param {Object} obj The payload object
   * @param {Object} session The payload object
   * @return {Object}
   * */
  public async createNewObject(obj, session?: ClientSession): Promise<any | T> {
    const toFill: string[] = this.entity.config().fillables;
    if (toFill && toFill.length > 0) {
      obj = _.pick(obj, ...toFill);
    }
    const data: any | T = new this.model({
      ...obj,
      public_id: Utils.generateUniqueId(this.entity.config().idToken),
    });
    return await data.save();
  }

  /**
   * @param {Object} id The payload object
   * @param {Object} obj The payload object
   * @return {Object}
   * */
  async updateObject(id, obj): Promise<any | T> {
    const toFill = this.entity.config().fillables;
    if (toFill && toFill.length > 0) {
      obj = _.pick(obj, ...toFill);
    }
    return this.model.findOneAndUpdate(
      { $or: [{ public_id: id }, { _id: id }] },
      { ...obj },
      { upsert: true, new: true, setDefaultOnInsert: true },
    );
  }

  /**
   * @param {Object} current The payload object
   * @param {Object} obj The payload object
   * @return {Object}
   * */
  async patchUpdate(current: any | T, obj: any): Promise<any | T> {
    const toFill: string[] = this.entity.config().updateFillables;
    if (toFill && toFill.length > 0) {
      obj = _.pick(obj, ...toFill);
    }
    _.extend(current, obj);
    return current.save();
  }

  /**
   * @param {Object} id The payload object
   * @param {Object} queryParser The payload object
   * @return {Object}
   * */
  public async findObject(
    id: any | string,
    queryParser: QueryParser = null,
  ): Promise<any | T> {
    const condition: any = {
      $or: [{ public_id: id }, { _id: id }],
      deleted: false,
    };
    const object: any | T = await this.model.findOne(condition);
    if (!object) {
      throw AppException.NOT_FOUND;
    }
    return object;
  }

  /**
   * @param {Object} obj The payload object
   * @return {Object}
   */
  public async deleteObject(obj: any | T): Promise<any | T> {
    if (this.entity.config().softDelete) {
      _.extend(obj, { deleted: true });
      obj = await obj.save();
    } else {
      obj = await obj.remove();
    }
    if (!obj) {
      AppException.NOT_FOUND;
    }
    return obj;
  }

  /**
   * @param {ResponseOption} option The response options
   * @return {Object} The formatted response
   * */
  public async getResponse(option: ResponseOption): Promise<any> {
    try {
      const meta: any = AppResponse.getSuccessMeta();
      if (option.token) {
        meta.token = option.token;
      }
      _.assign(meta, { statusCode: option.code });
      if (option.message) {
        meta.message = option.message;
      }
      if (option.value && option.queryParser && option.queryParser.population) {
        option.value = await this.model.populate(
          option.value,
          option.queryParser.population,
        );
      }
      if (option.pagination && !option.queryParser.getAll) {
        option.pagination.totalCount = option.count;
        if (option.pagination.morePages(option.count)) {
          option.pagination.next = option.pagination.current + 1;
        }
        meta.pagination = option.pagination.done();
      }
      if (
        this.entity.config().hiddenFields &&
        this.entity.config().hiddenFields.length
      ) {
        const isFunction = typeof option.value.toJSON === 'function';
        if (_.isArray(option.value)) {
          option.value = option.value.map((v) =>
            typeof v === 'string'
              ? v
              : _.omit(
                  isFunction ? v.toJSON() : v,
                  ...this.entity.config().hiddenFields,
                ),
          );
        } else {
          option.value = _.omit(
            isFunction ? option.value.toJSON() : option.value,
            ...this.entity.config().hiddenFields,
          );
        }
      }
      return AppResponse.format(meta, option.value);
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Pagination} pagination The pagination object
   * @param {QueryParser} queryParser The query parser
   * @return {Object}
   * */
  async buildModelQueryObject(
    pagination: Pagination,
    queryParser: QueryParser = null,
  ) {
    console.log('queryParser.query::::', queryParser.query);
    let query = this.model.find(queryParser.query);
    if (
      queryParser.search &&
      this.entity.searchQuery &&
      this.entity.searchQuery(queryParser.search).length > 0
    ) {
      const searchQuery = this.entity.searchQuery(queryParser.search);
      queryParser.query = {
        $or: [...searchQuery],
        ...queryParser.query,
      };
      query = this.model.find({ ...queryParser.query });
    }
    if (!queryParser.getAll) {
      query = query.skip(pagination.skip).limit(pagination.perPage);
    }
    if (!queryParser.getAll) {
      query = query.skip(pagination.skip).limit(pagination.perPage);
    }
    query = query.sort(
      queryParser && queryParser.sort
        ? _.assign(queryParser.sort, { createdAt: -1 })
        : '-createdAt ',
    );
    return {
      value: await query.select(queryParser.selection).exec(),
      count: await this.model.countDocuments(queryParser.query).exec(),
    };
  }

  /**
   * @param {Object} query The query object
   * @return {Promise<Object>}
   * */
  async countQueryDocuments(query): Promise<any | number> {
    const count = await this.model.aggregate(
      query.concat([{ $count: 'total' }]),
    );
    return count[0] ? count[0]['total'] : 0;
  }

  /**
   * @param {Pagination} pagination The pagination object
   * @param {Object} query The query object
   * @param {QueryParser} queryParser The query object
   * @return {Promise<Object>}
   * */
  async buildModelAggregateQueryObject(
    pagination: Pagination,
    query: any[],
    queryParser = null,
  ): Promise<any> {
    const count = await this.countQueryDocuments(query);
    query.push({
      $sort: queryParser.sort
        ? _.assign({}, { ...queryParser.sort, createdAt: -1 })
        : { createdAt: -1 },
    });
    if (!queryParser.getAll) {
      query.push(
        {
          $skip: pagination.skip,
        },
        {
          $limit: pagination.perPage,
        },
      );
    }
    return {
      value: await this.model
        .aggregate(query)
        .collation({ locale: 'en', strength: 1 }),
      count,
    };
  }

  /**
   * @param {Object} obj The payload object
   * @return {Object}
   */
  public async retrieveExistingResource(obj): Promise<any> {
    if (this.entity.config().uniques) {
      const uniqueKeys = this.entity.config().uniques;
      const query = {};
      for (const key of uniqueKeys) {
        query[key] = obj[key];
      }
      const found = await this.model.findOne({
        ...query,
        deleted: false,
        active: true,
      });
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * @param {String} id The payload object
   * @param {QueryParser} queryParser The payload object
   * @return {Promise<Object>}
   */
  public async validateObject(
    id,
    queryParser: QueryParser = null,
  ): Promise<any> {
    const condition: any = {
      $or: [{ public_id: id }, { _id: id }],
      ...queryParser.query,
    };
    return this.model.findOne(condition);
  }

  /**
   * @param {QueryParser} queryParser The payload object
   * @return {Promise<Object>}
   */
  public async searchObject(queryParser: QueryParser = null): Promise<any> {
    return await this.model.findOne({ ...queryParser.query });
  }
}
