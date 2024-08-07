import {Accessor, createSignal} from 'solid-js'

export default function createPersistedSignal<T>(key: string, initialValue:T): [Accessor<T>, (newValue: T) => void] {
  const storedValue = localStorage.getItem(key)
  const [value, setValue] = createSignal<T>(storedValue ? JSON.parse(storedValue) : initialValue)

  const setAndStoreValue = (newValue: T) => {
    // @ts-ignore
    setValue(newValue as T)
    localStorage.setItem(key, JSON.stringify(newValue))
  };

  return [value, setAndStoreValue];
}
