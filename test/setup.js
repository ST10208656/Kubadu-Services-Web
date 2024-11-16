// Mock Firebase
const mockFirestore = {
  collection: jest.fn(() => mockFirestore),
  doc: jest.fn(() => mockFirestore),
  updateDoc: jest.fn(() => Promise.resolve()),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-id' })),
  onSnapshot: jest.fn(() => () => {}),
  query: jest.fn(() => mockFirestore),
  where: jest.fn(() => mockFirestore),
  orderBy: jest.fn(() => mockFirestore),
  get: jest.fn(() => Promise.resolve({
    docs: [],
    forEach: jest.fn()
  })),
  getDoc: jest.fn(() => Promise.resolve({ exists: jest.fn(() => true) })),
  deleteDoc: jest.fn(() => Promise.resolve())
};

const mockAuth = {
  currentUser: {
    uid: 'test-uid',
    email: 'test@example.com'
  },
  onAuthStateChanged: jest.fn(callback => {
    callback(mockAuth.currentUser);
    return () => {};
  })
};

const mockStorage = {
  ref: jest.fn(() => ({
    getDownloadURL: jest.fn(() => Promise.resolve('test-url')),
    put: jest.fn(() => Promise.resolve())
  }))
};

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApp: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth)
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => mockStorage),
  ref: jest.fn(() => mockStorage.ref())
}));

// Mock DOM elements and functions
class MockElement {
  constructor() {
    this.style = {};
    this.innerHTML = '';
    this.src = '';
    this.value = '';
    this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(event, handler) {
    this[`on${event}`] = handler;
  }

  removeEventListener(event, handler) {
    if (this[`on${event}`] === handler) {
      delete this[`on${event}`];
    }
  }

  dispatchEvent(event) {
    const handler = this[`on${event.type}`];
    if (handler) {
      handler.call(this, event);
    }
    return true;
  }

  querySelector(selector) {
    return new MockElement();
  }

  querySelectorAll(selector) {
    return [new MockElement()];
  }
}

// Mock document methods
document.createElement = jest.fn(() => new MockElement());
document.getElementById = jest.fn(() => new MockElement());
document.querySelector = jest.fn(() => new MockElement());
document.querySelectorAll = jest.fn(() => [new MockElement()]);

// Mock window
global.window = {
  ...global.window,
  location: {
    href: 'http://localhost'
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock alert and console methods
global.alert = jest.fn();
global.confirm = jest.fn();
global.prompt = jest.fn();
global.console = {
  ...global.console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Mock Event constructor
class MockEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles || false;
    this.cancelable = options.cancelable || false;
  }

  preventDefault() {}
  stopPropagation() {}
}

global.Event = MockEvent;

// Mock click event
HTMLElement.prototype.click = function() {
  const event = new MockEvent('click', { bubbles: true });
  this.dispatchEvent(event);
};

// Mock Bootstrap Modal
class MockBootstrapModal {
  show() {}
  hide() {}
}

global.bootstrap = {
  Modal: jest.fn(() => new MockBootstrapModal())
};

// Export mocks for test files
global.mockFirestore = mockFirestore;
global.mockAuth = mockAuth;
global.mockStorage = mockStorage;
