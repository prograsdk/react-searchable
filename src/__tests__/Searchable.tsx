import debounce from 'lodash.debounce';
import {mount, ShallowWrapper, shallow} from 'enzyme';
import React, {ReactNode} from 'react';
import Searchable, {IProps, IRenderProp} from '../Searchable';

jest.mock('lodash.debounce', (): any => jest.fn((fn: () => any) => fn));

interface IUser {
  name: string;
}

interface ISetup<T> {
  wrapper: ShallowWrapper;
  props: IProps<T>;
}

function setup(overrides?: any): ISetup<IUser> {
  const props: IProps<IUser> = {
    items: [
      {
        name: 'Stewart Harrison',
      },
      {
        name: 'Jake Bullock',
      },
    ],
    predicate: (item: IUser, value: string): boolean =>
      item.name.includes(value),
    ...overrides,
  };

  const wrapper: ShallowWrapper = shallow<Searchable<IUser>, {}, {}>(
    <Searchable<IUser> {...props}>{() => null}</Searchable>,
  );

  return {
    props,
    wrapper,
  };
}

describe('<Searchable />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    let render: IRenderProp<IUser>;

    beforeEach(() => {
      render = () => <p>searchable</p>;
    });

    it('renders without crashing', () => {
      const {wrapper} = setup();

      expect(wrapper).toMatchSnapshot();
    });

    it('renders children if passed', () => {
      const {props} = setup();

      const wrapper = mount(
        <Searchable<IUser> {...props}>
          {render}
        </Searchable>,
      );

      expect(wrapper.find('p').exists()).toBe(true);
    });

    it('renders render prop if passed', () => {
      const {props} = setup();

      const wrapper = mount(
        <Searchable<IUser> {...props} render={render} />,
      );

      expect(wrapper.find('p').exists()).toBe(true);
    });

    it('renders null if no children or render is passed', () => {
      const {props} = setup();

      const wrapper = shallow(
        <Searchable<IUser> {...props} />,
      );

      expect(wrapper.type()).toBe(null);
    });
  });

  it('debounces filtering function', () => {
    const {wrapper} = setup();
    const instance = wrapper.instance() as Searchable<IUser>;

    const filter = instance.filterAndSetState;

    expect(debounce).toHaveBeenCalledWith(filter, 100);
  });

  it('does not debounce the function', () => {
    const {wrapper} = setup({debounce: false});

    expect(debounce).not.toHaveBeenCalled();
  });

  it('filters initial state based on props', () => {
    const {wrapper} = setup({initialValue: 'Jake'});

    expect(wrapper.state('items')).toEqual([{name: 'Jake Bullock'}]);
  });

  it('returns empty array if no matches', () => {
    const {wrapper} = setup();

    wrapper.setState({value: 'corncob'});

    expect(wrapper.state('items')).toEqual([]);
  });

  it('returns items prop if value is empty string', () => {
    const {wrapper, props: {items}} = setup({initialValue: 'corncob'});

    wrapper.setState({value: ''});

    expect(wrapper.state('items')).toEqual(items);
  });

  it('filters items based on predicate', () => {
    const {wrapper} = setup();

    wrapper.setState({value: 'Jake'});

    expect(wrapper.state('items')).toEqual([{name: 'Jake Bullock'}]);
  });

  it('does not call Searchable.filter if value is empty', () => {
    const {wrapper} = setup();

    // Mock Searchable.filter
    const filter = jest.fn();
    Searchable.filter = filter;

    wrapper.setState({ value: '' });

    expect(filter).not.toHaveBeenCalled();
  });

  describe('handleChange', () => {
    it('sets state', () => {
      const {wrapper} = setup();
      const instance = wrapper.instance() as Searchable<IUser>;
      const event = { target: { value: 'Jake' } } as React.ChangeEvent<HTMLInputElement>;

      instance.handleChange(event);

      expect(wrapper.state('value')).toEqual('Jake');
    });
  });
});
