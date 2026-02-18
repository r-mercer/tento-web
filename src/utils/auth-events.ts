export type AuthEventType = 'logout' | 'token-refreshed' | 'session-expired';

const authEventTarget = new EventTarget();

export const authEvents = {
  emit(type: AuthEventType, detail?: unknown): void {
    authEventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  },

  on(type: AuthEventType, handler: (detail?: unknown) => void): () => void {
    const listener = (event: Event) => {
      handler((event as CustomEvent).detail);
    };
    authEventTarget.addEventListener(type, listener);
    return () => authEventTarget.removeEventListener(type, listener);
  },
};
