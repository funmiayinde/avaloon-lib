import { Utils } from "../utils/index";

​
describe('addHourToDate', () => {
  it('should add hour(s) to current date using the default value', async () => {
    const generateNewdateSpy = jest.spyOn(Utils, 'addHourToDate');
​
    const result = Utils.addHourToDate();
​
   
​
    generateNewdateSpy.mockClear();
  });
​
  
});