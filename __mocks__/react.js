// Mock React for Jest
module.exports = {
  useState: jest.fn(initial => [initial, jest.fn()]),
  useEffect: jest.fn(fn => fn()),
  useCallback: jest.fn(fn => fn),
  useRef: jest.fn(initial => ({ current: initial })),
  useMemo: jest.fn((fn) => fn()),
  createContext: jest.fn(() => ({
    Provider: 'Provider',
    Consumer: 'Consumer',
  })),
  useContext: jest.fn(() => ({})),
  forwardRef: jest.fn(component => component),
  memo: jest.fn(component => component),
  Fragment: 'Fragment',
  createElement: jest.fn(),
  default: {
    useState: jest.fn(initial => [initial, jest.fn()]),
    useEffect: jest.fn(fn => fn()),
    useCallback: jest.fn(fn => fn),
    useRef: jest.fn(initial => ({ current: initial })),
  },
};
