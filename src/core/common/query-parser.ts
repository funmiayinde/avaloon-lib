import _ from 'lodash';
import mongoose from 'mongoose';
import { Utils } from '../utils';

/**
 * The QueryParser class
 * */
export class QueryParser {
  private _sort: any;
  private _population: any;
  private _selection: any;
  private _all: any;
  private _search: any;

  /**
   * @constructor
   * @param {Object} query This is a query object of the request
   * */
  constructor(public query: any) {
    this.initialize(query);
    const excluded = [
      'perPage',
      'page',
      'limit',
      'sort',
      'all',
      'includes',
      'selection',
      'population',
      'search',
      'regex',
      'nested',
    ];
    // omit special query string keys from query before passing down to the model for filtering
    this.query = _.omit(this.query, ...excluded);
    // Only get collection that has not been virtually deleted
    _.extend(this.query, { deleted: false });
    Object.assign(this, this.query);
  }

  /**
   * @return {Object} get the parsed query
   * */
  get search() {
    return this._search;
  }

  /**
   * @return {Object} get the population object for query
   * */
  get population() {
    if (this._population) {
      return this._population;
    }
    return [];
  }

  /**
   * @param {Object} value is the population object
   * */
  set population(value) {
    this._population = value;
    if (!_.isObject(value)) {
      try {
        this._population = JSON.parse(String(value));
      } catch (e) {
        console.log(e);
      }
    }
  }

  /**
   * @param {Object} value is the selection object
   * */
  set selection(value) {
    this._selection = value;
  }

  /**
   * @return  {Object} get the selection property
   **/
  get selection() {
    if (this._selection) {
      return this._selection;
    }
    return [];
  }

  /**
   * when String i.e  ?sort=name it is sorted by name ascending order
   * when Object ?sort[name]=desc  {name: 'desc'} it is sorted by name descending order
   * when object ?sort[name]=desc, sort[age]=asc {name: 'desc', age: 'asc'} it is sorted by name desc and age asc order
   * */
  get sort() {
    if (this.sort) {
      if (_.isEmpty(this.sort)) {
        try {
          this._sort = JSON.parse(this.sort);
        } catch (e) {
          return { [this._sort]: 1 };
        }
      }
      for (const [column, direction] of Object.entries(this._sort)) {
        if (typeof direction === 'string') {
          this.sort[column] = direction.toLowerCase() === 'asc' ? 1 : -1;
        }
      }
      return this._sort;
    }
    return { createdAt: -1 };
  }

  /**
   * @return {Boolean} get the value for all data request
   * */
  get getAll() {
    return this._all;
  }

  /**
   * @param {Object} query is the population object
   * when ?nested={key: 'column', value: inArray: ['mongooseIds']}
   * e.g ?nested={key: 'comments', value: inArray: ['608ae8593eefd91eb59bc333', '608ae8593eefd91eb59bc332']}
   * */
  processNestedQuery(query: any) {
    let value: any = query.nested;
    const result: any = {};
    if (value) {
      try {
        value = JSON.parse(value.toString());
        for (const filter of value) {
          if (filter.hasOwnProperty('key') && filter.hasOwnProperty('value')) {
            const ids: any[] = filter.value.inArray || [];
            if (filter.hasOwnProperty('isValue')) {
              filter.value = { $in: ids };
            } else {
              filter.value = {
                $in: ids.map((v: any) => mongoose.Types.ObjectId(v)),
              };
            }
            result[filter.key] = filter.value;
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    return result;
  }

  /**
   * @param {Object} query is the population object
   **/
  processConditionQuery(query) {
    let value: any = query.condition;
    const result: any = {};
    if (value) {
      try {
        value = JSON.parse(value.toString());
        if (value.hasOwnProperty('key')) {
          const filters: any[] = [];
          for (const condition of value.array) {
            if (
              condition.hasOwnProperty('key') &&
              condition.hasOwnProperty('value')
            ) {
              if (Utils.isObjectId(condition.value)) {
                filters.push({
                  [condition.key]: mongoose.Types.ObjectId(condition.value),
                });
              } else {
                filters.push({ [condition.key]: condition.value });
              }
            }
          }
          result[`$${value.key}`] = filters;
        }
      } catch (e) {
        console.log(e);
      }
    }
    return result;
  }

  /**
   * @param {Object} query is the population object
   * */
  processRegSearch(query: any) {
    const value: any = query.regex;
    const result: any = {};
    if (!_.isObject(value)) {
      try {
        const regex = JSON.parse(value.toString());
        for (const r of regex) {
          const q = new RegExp(r.value);
          result[r.key] = { $regex: q, $options: 'i' };
        }
      } catch (e) {
        console.log(e);
      }
    }
    return result;
  }

  /**
   * Initialize all the special object required for the find query
   * @param {Object} query This is a query object of the request
   * */
  initialize(query: any) {
    this._all = query.all;
    this._sort = query.sort;
    if (query.population) {
      this.population = query.population;
    }
    if (query.search) {
      this._search = query.search;
    }
    if (query.selection) {
      this.selection = { ...this.query, ...query.selection };
    }
    if (query.nested) {
      this.query = { ...this.query, ...this.processNestedQuery(query) };
    }
    if (query.condition) {
      this.query = { ...this.query, ...this.processConditionQuery(query) };
    }
    if (query.regex) {
      this.query = { ...this.query, ...this.processRegSearch(query) };
    }
  }
}
