import { AnyFieldApi } from '@tanstack/react-form';
import type { FC } from 'react';

export type FieldInfoProps = {
  field: AnyFieldApi
}

export const FieldInfo: FC<FieldInfoProps> = ({ field }) => {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.join(', ')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  );
};
