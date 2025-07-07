import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FundingService } from './funding.service';
import { CreateFundingDto } from './dto/create-funding.dto';
import { UpdateFundingDto } from './dto/update-funding.dto';
import { JwtCookieRolesGuard } from 'src/auth/guards/jwt-cookie-roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { ApiResponse } from 'src/common/response/api-response';

@Controller('api/funding')
@UseGuards(JwtCookieRolesGuard)
export class FundingController {
  constructor(private readonly fundingService: FundingService) { }

  @Post()
  async createFunding(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateFundingDto
  ) {
    try {
      const result = await this.fundingService.create(dto, req.user.sub);
      return ApiResponse.success(result, 'Snap token created successfully');
    } catch (err) {
      return ApiResponse.error('Failed to create funding', [err.message]);
    }
  }
}
