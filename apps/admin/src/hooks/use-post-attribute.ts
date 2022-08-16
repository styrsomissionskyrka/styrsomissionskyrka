import { useDispatch, useSelect } from '@wordpress/data';
import * as React from 'react';
import { useCallback } from 'react';
import * as z from 'zod';

import { EditorRetreatSchema } from '../types/retreat';

export const useRetreatAttribute = createUseAttributeHook(EditorRetreatSchema);

function createUseAttributeHook<Schema extends z.ZodTypeAny, Type extends z.infer<Schema>>(schema: Schema) {
  return function useAttribute<K extends keyof Type & string>(key: K) {
    const value = useSelect<Type[K]>(
      (select) => {
        let post = schema.parse(select('core/editor').getCurrentPost());
        return post[key];
      },
      [key],
    );

    const { editPost } = useDispatch('core/editor');

    const setAttribute = useCallback(
      (setter: React.SetStateAction<Type[K]>) => {
        if (typeof setter === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return editPost({ [key]: (setter as unknown as any)(value) });
        } else {
          return editPost({ [key]: setter });
        }
      },
      [editPost, key, value],
    );

    return [value, setAttribute] as const;
  };
}
