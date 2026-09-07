import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  jenisProduk: string;

  @IsString()
  @IsNotEmpty()
  ukuran: string; // S, M, L, XL, XXL

  @IsNumber()
  @Min(1)
  jumlahPcs: number;
}

export class CreateOrderDto {
  // Info Customer
  @IsString()
  @IsNotEmpty()
  namaCustomer: string;

  @IsString()
  @IsOptional()
  kontakCustomer?: string;

  @IsString()
  @IsOptional()
  alamatCustomer?: string;

  // Detail Order
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsNumber()
  @Min(0)
  totalHarga: number;

  @IsNumber()
  @Min(0)
  dp: number;

  // Item Baju/Pakaian
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
