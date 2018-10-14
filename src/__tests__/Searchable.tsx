import {mount, shallow, ShallowWrapper} from 'enzyme';
import debounce from 'lodash.debounce';
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
    predicate: (item: IUser, query: string): boolean =>
      item.name.includes(query),
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
        <Searchable<IUser> {...props}>{render}</Searchable>,
      );

      expect(wrapper.find('p').exists()).toBe(true);
    });

    it('renders render prop if passed', () => {
      const {props} = setup();

      const wrapper = mount(<Searchable<IUser> {...props} render={render} />);

      expect(wrapper.find('p').exists()).toBe(true);
    });
  });

  describe('debouncing', () => {
    it('debounces filtering function with default on true', () => {
      const {wrapper} = setup({debounce: true});
      const instance = wrapper.instance() as Searchable<IUser>;

      const filter = instance.filterAndSetState;

      expect(debounce).toHaveBeenCalledWith(
        filter,
        Searchable.defaultProps.debounce,
      );
    });

    it('debounces filtering function with pased duration', () => {
      const {wrapper} = setup({debounce: 500});
      const instance = wrapper.instance() as Searchable<IUser>;

      const filter = instance.filterAndSetState;

      expect(debounce).toHaveBeenCalledWith(filter, 500);
    });

    it('does not debounce the function on false', () => {
      const {wrapper} = setup({debounce: false});

      expect(debounce).not.toHaveBeenCalled();
    });
  });

  it('filters initial state based on props', () => {
    const {wrapper} = setup({initialQuery: 'Jake'});

    expect(wrapper.state('items')).toEqual([{name: 'Jake Bullock'}]);
  });

  it('returns empty array if no matches', () => {
    const {wrapper} = setup();

    wrapper.setState({query: 'corncob'});

    expect(wrapper.state('items')).toEqual([]);
  });

  it('returns items prop if query is empty string', () => {
    const {
      wrapper,
      props: {items},
    } = setup({initialQuery: 'corncob'});

    wrapper.setState({query: ''});

    expect(wrapper.state('items')).toEqual(items);
  });

  it('filters items based on predicate', () => {
    const {wrapper} = setup();

    wrapper.setState({query: 'Jake'});

    expect(wrapper.state('items')).toEqual([{name: 'Jake Bullock'}]);
  });

  it('does not call Searchable.filter if query is empty', () => {
    const {wrapper} = setup();

    // Mock Searchable.filter
    const filter = jest.fn();
    Searchable.filter = filter;

    wrapper.setState({query: ''});

    expect(filter).not.toHaveBeenCalled();
  });

  describe('handleChange', () => {
    it('sets state', () => {
      const {wrapper} = setup();
      const instance = wrapper.instance() as Searchable<IUser>;

      // tslint:disable:no-object-literal-type-assertion
      const event = {
        target: {value: 'Jake'},
      } as React.ChangeEvent<HTMLInputElement>;

      instance.handleChange(event);

      expect(wrapper.state('query')).toEqual('Jake');
    });
  });
});
