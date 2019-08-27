/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 // react的基类封装

import invariant from 'shared/invariant';
import lowPriorityWarning from 'shared/lowPriorityWarning';

import ReactNoopUpdateQueue from './ReactNoopUpdateQueue';

const emptyObject = {};
if (__DEV__) {
  Object.freeze(emptyObject);
}

/**
 * Base class helpers for the updating state of a component.
 * 这个基类是用来帮助组件state的更新
 * component函数本身只负责接受参数
 */
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  // 如果一个组件有字符串refs，我们稍后将分配一个不同的对象给它
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  // 我们会初始化一个默认的更新器（ReactNoopUpdateQueue）给它，但是实际的更新程序我们是通过渲染器注入的。
  // 这是为了让组件的更新可以跨平台，它可以是web浏览器的DOM操作，也可以是原生APP的节点更新。
  this.updater = updater || ReactNoopUpdateQueue;
}

// 在组件的原型链上注入一个空对象isReactComponent（注1：直译为是否是React组件，使用地点待考察）
Component.prototype.isReactComponent = {};

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 * 设置state的子集。总是使用它去改变state，您应该将“this.state”视为不可变的。（不理解）
 * 
 * 无法保证“this.state”将立即更新，因此调用此方法后访问“this.state”可能会返回旧值。 （这里说明this.setState是一个异步方法）
 * 
 * 当一个函数被提供给setState方法时，它将在将来的某个时候被调用（不是同步的）。
 * 它将使用最新的组件参数（状态、属性、上下文）来调用。
 * 这些值可能与此不同。
 * 因为您的函数可以在接收props之后但在shouldComponentUpdate之前调用，
 * 并且此新状态、props和context尚未分配给此。
 * 
 *
 * 参数partialState -- 下一个部分状态或函数，用来与另一部分的状态合并获取当前的状态。
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * 参数callback -- 当state更新完成后的回调
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
Component.prototype.setState = function(partialState, callback) {
  // 当传入setState的不为'object' || 'function' || null 时 出现错误提示信息
  invariant(
    typeof partialState === 'object' ||
      typeof partialState === 'function' ||
      partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
      'function which returns an object of state variables.',
  );
  // 执行注入的更新器的enqueueSetState方法
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 * 
 * 强制更新。只有当确定我们在一个DOM事务中是**而不是**时，才应该调用它。
 * 
 * 当您知道组件状态的某些更深层的方面已更改但未调用“setState”时，您可能需要调用它。
 * 
 * 这不会调用“shouldComponentUpdate”，但它将调用`componentwillupdate`和`componentdiddupdate`。
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
Component.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 * 已弃用的API。这些API以前存在于经典的react类上，
 * 但由于我们想弃用它们，所以我们不会将它们转移到这个现代的基类上。
 * 相反，我们定义了一个getter，它会在访问时发出警告。
 */
if (__DEV__) {
  const deprecatedAPIs = {
    isMounted: [
      'isMounted',
      'Instead, make sure to clean up subscriptions and pending requests in ' +
        'componentWillUnmount to prevent memory leaks.',
    ],
    replaceState: [
      'replaceState',
      'Refactor your code to use setState instead (see ' +
        'https://github.com/facebook/react/issues/3236).',
    ],
  };
  const defineDeprecationWarning = function(methodName, info) {
    Object.defineProperty(Component.prototype, methodName, {
      get: function() {
        lowPriorityWarning(
          false,
          '%s(...) is deprecated in plain JavaScript React classes. %s',
          info[0],
          info[1],
        );
        return undefined;
      },
    });
  };
  for (const fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    }
  }
}

function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

/**
 * Convenience component with default shallow equality check for sCU
 * 带有SCU默认的浅检查的便利组件。
 * PureComponent的构成与Components一样
 */
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}


const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

export {Component, PureComponent};
