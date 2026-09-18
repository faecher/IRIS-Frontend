import { camelize, getCurrentInstance, toHandlerKey } from 'vue'

export function useEmitAsProps<EventName extends string>(
  emit: (name: EventName, ...args: any[]) => void,
) {
  const result: Record<string, any> = {}
  const vm = getCurrentInstance()
  if (!vm)
    return result

  const events: EventName[] = Array.isArray(vm.type.emits)
    ? vm.type.emits
    : typeof vm.type.emits === 'object'
      ? Object.keys(vm.type.emits)
      : []

  if (!events.length) {
    console.warn(
      `No emitted event found. Please check component: ${vm.type.__name}`,
    )
  }

  for (let i = 0; i < events.length; i++) {
    result[toHandlerKey(camelize(events[i]!))] = (...args: any) =>
      emit(events[i]!, ...args)
  }

  return result
}
