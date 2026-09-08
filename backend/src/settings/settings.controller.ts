import { Controller, Get, Body, Put } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateSettingDto } from './dto/update-setting.dto.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  updateSettings(@Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.updateSettings(updateSettingDto);
  }
}
