import { AppException } from '../';
import { BaseService } from '../_base';
​

export class MockBaseModelClass {
    public static collection = { collectionName: 'MockAttributeModel' };
    public static config = () => {
        return {
          fillables: ['name'],
          updateFillables: ['name'],
          uniques: ['name'],
          dateFilters: ['createdAt', 'updatedAt'],
          softDelete: true,
        };
      };
      data: any;

      constructor(data: any) {
        this.data = data;
      }
    ​

    static findOne(data: any) {
        return {
          data,
          populate:
            data['_id'] === undefined
              ? jest.fn().mockImplementation(() => null)
              : jest.fn().mockImplementation(() => {
                  return this.populate(data);
                }),
          save: jest.fn(),
          sort: jest.fn().mockImplementation(() => data),
          exec: jest.fn().mockImplementation(function () {
            return this.data;
          }),
        };
      }

      static find(data: any) {
        return {
            data,
            save: jest.fn(),
            skip: jest.fn().mockImplementation(function () {
              return this;
            }),
            limit: jest.fn().mockImplementation(function () {
              return this;
            }),
            sort: jest.fn().mockImplementation(function () {
              return this;
            }),
            select: jest.fn().mockImplementation(function () {
              return this;
            }),
            exec: jest.fn().mockImplementation(function () {
              return this.data;
            }),
          };
      }

      static searchQuery(data: any) {
        return data;
        // return { data, save: jest.fn().mockImplementation(() => data) };
      }

      static async distinct(key: any, obj: any) {
        return { key, obj };
      }
    ​
      static aggregate(data: any) {
        return { data, collation: jest.fn().mockImplementation(() => data) };
      }
}