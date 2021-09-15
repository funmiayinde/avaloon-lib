import * as queryString from 'query-string';
import * as Url from 'url-parse';

interface PaginationOption {
  totalCount: number;
  perPage?: number;
  current?: number;
  previous?: number;
  previousPage?: string;
  currentPage?: string;
  more?: boolean;
  nextPage?: string;
  next?: string;
}

/**
 * The Pagination class
 * */
export class Pagination {
  private pagination: PaginationOption = { totalCount: 0 };
  private urlObj: URL;
  private query: any;

  _perPage: number;
  _current: number;
  _skip: number;
  _queryData: any;

  /**
   * @constructor
   * @param {String} requestUrl This is a query object
   * @param {String} url This is a query object
   * @param {String} itemPerPage This is query object
   * */
  constructor(private requestUrl: string, url: string, itemPerPage = 10) {
    // Default paginaiton object
    this.urlObj = new URL(`${url}${requestUrl}`);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const urlObj: Url = this.urlObj;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const search: string = urlObj.query;
    // Parse the query string into the object
    this.query = queryString.parse(search);
    //Grab the pagination object from the query object

    // The Limit(count to be returned)
    this._perPage =
      this.query && this.query.perPage
        ? parseInt(this.query.perPage, 10)
        : itemPerPage;
    this.pagination.perPage = this._perPage;

    // The amount to be skipped
    this._skip = 0;
    const perPage = this._perPage;
    this._queryData = { perPage: perPage.toString() };
    urlObj.set('query', this._queryData);

    // Current page number
    this._current =
      this.query && this.query.page ? parseInt(this.query.page, 10) : 1;
    const page = this._current;
    if (page && page > 1) {
      const urlObj: any | Url = this.urlObj;
      const previous = page - 1;
      this._skip = previous * perPage;
      this.pagination.previous = previous;
      urlObj.set('query', { ...this._queryData, page: previous.toString() });
      this.pagination.previousPage = urlObj.href;
    }
    this.pagination.current = page;
    urlObj.set('query', { ...this._queryData, page: page.toString() });
    this.pagination.previousPage = urlObj.href;
  }

  /**
   * @param {Number} page The next page number
   * @return {VoidFunction}
   * */
  set next(page: any | number) {
    const urlObj: any | Url = this.urlObj;
    this.pagination.next = page;
    urlObj.set('query', { ...this._queryData, page: page.toString() });
    this.pagination.previousPage = urlObj.href;
  }

  /**
   * @param {Boolean} more Checks if there are more items
   * @returns {VoidFunction}
   * */
  set more(more: boolean) {
    this.pagination.more = more;
  }

  /**
   * @returns {Number}
   * */
  get skip() {
    return this._skip;
  }

  /**
   * @param {Number} count The amount of items to skip
   * @return {Number}
   * */
  set skip(count: number) {
    this._skip = count;
  }

  /**
   * @return {Number}
   **/
  get perPage() {
    return this._perPage;
  }

  /**
   * @return {Number}
   **/
  get current() {
    return this._current;
  }

  /**
   * @return {Number} total count
   */
  get totalCount() {
    return this.pagination.totalCount;
  }

  /**
   * @param {Number} count The total count of items
   * @return {VoidFunction}
   * */
  set totalCount(count: number) {
    this.pagination.totalCount = count;
  }

  /**
   * @param {Number} count The total count of items
   * @return {Boolean}
   * */
  morePages(count: any | number) {
    return count > this._perPage * this._current;
  }

  /**
   * @return {Object}
   * */
  done() {
    return this.pagination;
  }
}
