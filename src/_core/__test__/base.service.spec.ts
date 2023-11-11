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

        it('should find an object from a collection of objects with a invalid object id', async () => {
            const id = '6322074f7aa';

            baseServiceSpy = jest.spyOn(baseService, 'findObject');

            let result;

            try {
                result = await baseService.findObject(id);
                expect(baseServiceSpy).toHaveBeenCalled();
                expect(baseServiceSpy).toHaveBeenCalledWith(id);
                expect(baseServiceSpy).not.toThrowError('Data doesnt exist');
                expect(result.data).toBeInstanceOf(Object);
                expect(result.data).not.toHaveProperty('_id');
                expect(result.data).toHaveProperty('publicId');
            } catch (e) {
                expect(e).toBeInstanceOf(AppException);
                expect(e).toEqual({
                    code: 404,
                    message: 'Data not found',
                    messages: undefined,
                });
            }
        });
    });

    describe('deleteObject', () => {
        it('should delete an object', async () => {
            const payload = {
                userId: '631a04ba9cebaac253e97402',
                name: 'test',
                save: jest.fn().mockImplementation(function () {
                    return this;
                }),
            };

            baseServiceSpy = jest.spyOn(baseService, 'deleteObject');
            const result = await baseService.deleteObject(payload);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(payload);
            expect(payload.save).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty('deleted');
            expect(result['deleted']).toBe(true);
        });
    });

    describe('buildModelQueryObject', () => {
        let pagination;
        let queryParser;

        it('should build model query object without sorting', async () => {
            pagination = {
                totalCount: 120,
                perPage: 10,
                skip: 1,
            };
            queryParser = {
                query: {
                    deleted: true,
                    createdAt: Date.now(),
                },
                page: 1,
                search: ['mock data'],
            };

            baseServiceSpy = jest.spyOn(baseService, 'buildModelQueryObject');
            const result = await baseService.buildModelQueryObject(
                pagination,
                queryParser,
            );

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(pagination, queryParser);
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty('value');
            expect(result).toHaveProperty('count');
            expect(result['value']).toBeInstanceOf(Object);
            expect(result['count']).toBeInstanceOf(Object);
        });

        it('should build model query object without sorting', async () => {
            pagination = {
                totalCount: 120,
                perPage: 10,
                skip: 1,
            };
            queryParser = {
                query: {
                    deleted: true,
                    createdAt: Date.now(),
                },
                page: 1,
                search: ['mock data'],
            };
            const updatedQueryParser = Object.assign({}, queryParser, { sort: {} });

            baseServiceSpy = jest.spyOn(baseService, 'buildModelQueryObject');
            const result = await baseService.buildModelQueryObject(
                pagination,
                updatedQueryParser,
            );

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(
                pagination,
                updatedQueryParser,
            );
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty('value');
            expect(result).toHaveProperty('count');
            expect(result['value']).toBeInstanceOf(Object);
            expect(result['count']).toBeInstanceOf(Object);
        });
    });

    describe('buildSearchQuery', () => {
        let queryParser;

        it('should build search query from provided payload', async () => {
            queryParser = {
                query: {
                    deleted: true,
                    createdAt: Date.now(),
                },
            };
            baseServiceSpy = jest.spyOn(baseService, 'buildSearchQuery');
            const result = await baseService.buildSearchQuery(queryParser);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(queryParser);
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty('createdAt');
            expect(result).not.toHaveProperty('deleted');
        });
    });

    describe('countQueryDocuments', () => {
        let query;

        it('should build search query from provided payload', async () => {
            query = [];
            baseServiceSpy = jest.spyOn(baseService, 'countQueryDocuments');
            const result = await baseService.countQueryDocuments(query);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(query);
            expect(typeof result === 'number').toBe(true);
        });
    });

    describe('buildModelAggregateQueryObject', () => {
        const pagination = {
            totalCount: 120,
            perPage: 10,
            skip: 1,
        };
        const query = [];

        const queryParser = {
            query: {
                deleted: true,
                createdAt: Date.now(),
            },
            page: 1,
            search: ['mock data'],
        };

        it('should build model aggregate query object without sorting', async () => {
            baseServiceSpy = jest.spyOn(
                baseService,
                'buildModelAggregateQueryObject',
            );
            const countQueryDocumentsSpy = jest.spyOn(
                baseService,
                'countQueryDocuments',
            );

            const result = await baseService.buildModelAggregateQueryObject(
                pagination,
                query,
                queryParser,
            );

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(
                pagination,
                query,
                queryParser,
            );
            expect(countQueryDocumentsSpy).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty('value');
            expect(result).toHaveProperty('count');
            expect(result['value']).toBeInstanceOf(Array);
            expect(typeof result['count'] === 'number').toBe(true);

            countQueryDocumentsSpy.mockClear();
        });

        it('should build model aggregate query object with sorting', async () => {
            const updatedQueryParser = Object.assign({}, queryParser, { sort: {} });
            baseServiceSpy = jest.spyOn(
                baseService,
                'buildModelAggregateQueryObject',
            );
            const countQueryDocumentsSpy = jest.spyOn(
                baseService,
                'countQueryDocuments',
            );

            const result = await baseService.buildModelAggregateQueryObject(
                pagination,
                query,
                updatedQueryParser,
            );

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(
                pagination,
                query,
                updatedQueryParser,
            );
            expect(countQueryDocumentsSpy).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty('value');
            expect(result).toHaveProperty('count');
            expect(result['value']).toBeInstanceOf(Array);
            expect(typeof result['count'] === 'number').toBe(true);

            countQueryDocumentsSpy.mockClear();
        });
    });

    describe('retrieveExistingResource', () => {
        it('should retrieve an existing resource with a non-empty payload', async () => {
            const payload = {
                name: 'test',
            };

            baseServiceSpy = jest.spyOn(baseService, 'retrieveExistingResource');
            const result = await baseService.retrieveExistingResource(payload);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(payload);
            expect(result.data).toBeInstanceOf(Object);
            expect(result.data).toHaveProperty('deleted');
            expect(result.data['deleted']).toBe(false);
        });

        // it('should retrieve an existing resource with an empty payload', async () => {
        //   const payload = {};

        //   baseServiceSpy = jest.spyOn(baseService, 'retrieveExistingResource');
        //   const configMock = MockBaseModelClass.config as unknown as jest.Mock;
        //   configMock.mockImplementation(() => {
        //     return {
        //       fillables: ['name'],
        //       updateFillables: ['name'],
        //       uniques: [],
        //       dateFilters: ['createdAt', 'updatedAt'],
        //       softDelete: true,
        //     };
        //   });
        //   const result = await baseService.retrieveExistingResource(payload);

        //   expect(baseServiceSpy).toHaveBeenCalled();
        //   expect(baseServiceSpy).toHaveBeenCalledWith(payload);
        //   expect(result).toBe(null);
        // });
    });

    describe('validateObject', () => {
        it('should validate provided payload', async () => {
            const payload = {
                id: '631a04ba9cebaac253e97402',
            };

            baseServiceSpy = jest.spyOn(baseService, 'validateObject');
            const result = await baseService.validateObject(payload);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(payload);
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty('data');
            expect(result.data).toHaveProperty('deleted');
            expect(result.data['deleted']).toBe(false);
        });
    });

    describe('searchOneObject', () => {
        let query;
        it('should search one object with provided query ', async () => {
            query = {
                deleted: true,
                createdAt: Date.now(),
                latest: JSON.stringify({}),
            };

            baseServiceSpy = jest.spyOn(baseService, 'searchOneObject');
            const result = await baseService.searchOneObject(query);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(query);
            expect(result).toBeInstanceOf(Object);
        });
    });

    describe('findByUniqueKey', () => {
        it('should search a collection using a unique key with provided params', async () => {
            const key = 'test-key';
            const params = {};

            baseServiceSpy = jest.spyOn(baseService, 'findByUniqueKey');
            const result = await baseService.findByUniqueKey(key, params);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(key, params);
            expect(result).toBeInstanceOf(Object);
        });

        it('should search a collection using a unique key with default params', async () => {
            const key = 'test-key';

            baseServiceSpy = jest.spyOn(baseService, 'findByUniqueKey');
            const result = await baseService.findByUniqueKey(key);

            expect(baseServiceSpy).toHaveBeenCalled();
            expect(baseServiceSpy).toHaveBeenCalledWith(key);
            expect(result).toBeInstanceOf(Object);
        });
    });
});
