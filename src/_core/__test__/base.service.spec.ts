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
}