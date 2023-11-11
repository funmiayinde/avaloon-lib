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
}