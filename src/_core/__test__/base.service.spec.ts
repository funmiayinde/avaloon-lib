import { AppException } from '../';
import { BaseService } from '../_base';


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

    static aggregate(data: any) {
        return { data, collation: jest.fn().mockImplementation(() => data) };
    }

    static countDocuments(data: any) {
        return { data, exec: jest.fn().mockImplementation(() => data) };
    }

    static findOneAndUpdate(data: any, options1: any, options2: any) {
        return { data, save: jest.fn() };
    }

    static deleteMany(data: any, options1: any, options2: any) {
        return { data, save: jest.fn() };
    }

    static populate(data: any, options1: any = {}, options2: any = {}) {
        return { data, save: jest.fn() };
    }

    save() {
        // console.log('Yaay, I saved!');
        return this.data;
    }

    remove(data: any, options1: any, options2: any) {
        return { data, save: jest.fn() };
    }
}


describe('BaseService', () => {
    let baseService: BaseService;
    let baseServiceSpy: jest.SpyInstance;

    beforeAll(() => {
        baseService = new BaseService(MockBaseModelClass);
    });


    afterEach(() => {
        baseServiceSpy.mockClear();
    });

    describe('createNewObject', () => {
        it('should create a new object', async () => {
            const payLoad = {
                userId: '631a04ba9cebaac253e97402',
            };

            baseServiceSpy = jest.spyOn(baseService, 'createNewObject');
            const result = await baseService.createNewObject(payLoad);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty('publicId');
        });
    });

    describe('updateObject', () => {
        it('should update an existing object', async () => {
          const payload = {
            userId: '631a04ba9cebaac253e97402',
            name: 'test',
          };
          const id = '6322074f7aa98fd0a96c97a8';
    
          baseServiceSpy = jest.spyOn(baseService, 'updateObject');
          const result = await baseService.updateObject(id, payload);
    
          expect(baseServiceSpy).toHaveBeenCalled();
          expect(result.data).toBeInstanceOf(Object);
          expect(result.data).toHaveProperty('_id');
        });
      });

      describe('patchUpdate', () => {
        it('should update an existing entity', async () => {
          const currentObject = {
            userId: '631a04ba9cebaac253e97402',
            name: 'test',
            save: jest.fn().mockImplementation(function () {
              return this;
            }),
          };
          const payload = {
            name: 'patch test',
          };
    
          baseServiceSpy = jest.spyOn(baseService, 'patchUpdate');
          const result = await baseService.patchUpdate(currentObject, payload);
    
          expect(baseServiceSpy).toHaveBeenCalled();
          expect(result).toBeInstanceOf(Object);
          expect(currentObject.save).toHaveBeenCalled();
        });
      });

      describe('findObject', () => {
        afterEach(() => {
          baseServiceSpy.mockClear();
        });
        it('should find an object from a collection of objects with a valid object id', async () => {
          const id = '6322074f7aa98fd0a96c97a8';
    
          baseServiceSpy = jest.spyOn(baseService, 'findObject');
          const result = await baseService.findObject(id);
    
          expect(baseServiceSpy).toHaveBeenCalled();
          expect(baseServiceSpy).toHaveBeenCalledWith(id);
          expect(result.data).toBeInstanceOf(Object);
          expect(result.data).toHaveProperty('_id');
        });
    

});
