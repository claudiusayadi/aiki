import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsBoolean as DefaultIsBoolean,
  ValidationOptions,
} from 'class-validator';

const toBoolean = (value: unknown) => {
  switch (value) {
    case null:
      return 'Failure';

    case 'true':
      return true;
    case 'false':
      return false;

    default:
      return value;
  }
};

const ToBoolean = () =>
  Transform(({ obj, key }: { obj: Record<string, unknown>; key: string }) =>
    toBoolean(obj[key]),
  );

/** Checks if the value is a boolean. Works with query params. */
export const IsBoolean = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  applyDecorators(DefaultIsBoolean(validationOptions), ToBoolean());
