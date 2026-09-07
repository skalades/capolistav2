import { Test, TestingModule } from '@nestjs/testing';
import { HrController } from './hr.controller.js';

describe('HrController', () => {
  let controller: HrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrController],
    }).compile();

    controller = module.get<HrController>(HrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
