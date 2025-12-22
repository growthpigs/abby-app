// Mock React Native for Jest
module.exports = {
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
  },
  StyleSheet: {
    create: styles => styles,
    absoluteFillObject: {},
  },
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  Animated: {
    View: 'Animated.View',
    Value: class {
      constructor(val) { this._value = val; }
      setValue(val) { this._value = val; }
      setOffset(val) { this._offset = val; }
      flattenOffset() {}
    },
    spring: jest.fn(() => ({ start: jest.fn() })),
  },
  PanResponder: {
    create: jest.fn(() => ({ panHandlers: {} })),
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
  LogBox: {
    ignoreLogs: jest.fn(),
  },
};
