import { Utils } from "../utils/index";


describe('addHourToDate', () => {
    it('should add hour(s) to current date using the default value', async () => {
        const generateNewdateSpy = jest.spyOn(Utils, 'addHourToDate');

        const result = Utils.addHourToDate();

        expect(generateNewdateSpy).toHaveBeenCalled();
        expect(generateNewdateSpy).toHaveBeenCalledWith();
        expect(generateNewdateSpy).toHaveReturned();
        expect(generateNewdateSpy).toHaveReturnedWith(result);
        expect(result instanceof Date).toBe(true);

        generateNewdateSpy.mockClear();
    });

    it('should add hour(s) to current date', async () => {
        const hour = 2;

        const generateNewdateSpy = jest.spyOn(Utils, 'addHourToDate');

        const result = Utils.addHourToDate(hour);

        expect(generateNewdateSpy).toHaveBeenCalled();
        expect(generateNewdateSpy).toHaveBeenCalledWith(hour);
        expect(generateNewdateSpy).toHaveReturned();
        expect(generateNewdateSpy).toHaveReturnedWith(result);
        expect(result instanceof Date).toBe(true);

        generateNewdateSpy.mockClear();
    });
});