/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import warningWithoutStack from 'shared/warningWithoutStack';

const didWarnStateUpdateForUnmountedComponent = {};

/**
 * 根据传入publicInstance以及callerName，生成warningKey。 
 * 如果didWarnStateUpdateForUnmountedComponent[warningKey]为true表示已经报错，直接跳过。
 *  为false，则显示错误信息，并标记didWarnStateUpdateForUnmountedComponent[warningKey]为true。
 * @param {*} publicInstance 
 * @param {*} callerName 
 */

function warnNoop(publicInstance, callerName) {
  // 在开发模式下执行
  if (__DEV__) {
    const constructor = publicInstance.constructor;
    //获取组件名，通过实例的构造函数来获取，如果不存在，那么构造函数就是ReactClass。
    const componentName =
      (constructor && (constructor.displayName || constructor.name)) ||
      'ReactClass';
    //关键词就是组件名.回调函数名，也就是下面的更新队列的抽象类的属性方法名
    const warningKey = `${componentName}.${callerName}`;
    //如果didWarnStateUpdateForUnmountedComponent存储组件还没挂载的时候状态更新出现的错误
    // 如果已经存在了这个错误，直接返回，不需要执行下面的错误提示以及存储相应的错误标记。
    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
      return;
    }
    //该方法的作用：一直报错，并显示错误信息
    warningWithoutStack(
      false,
      "Can't call %s on a component that is not yet mounted. " +
        'This is a no-op, but it might indicate a bug in your application. ' +
        'Instead, assign to `this.state` directly or define a `state = {};` ' +
        'class property with the desired state in the %s component.',
      callerName,
      componentName,
    );
    //将该类型的错误标记为true
    didWarnStateUpdateForUnmountedComponent[warningKey] = true;
  }
}

/**
 * This is the abstract API for an update queue.
 * 这是更新队列的抽象API。
 */
const ReactNoopUpdateQueue = {
  /**
   * Checks whether or not this composite component is mounted.
   * 检查是否已安装此复合组件。
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function(publicInstance) {
    return false;
  },

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
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueForceUpdate: function(publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate');
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueReplaceState: function(
    publicInstance,
    completeState,
    callback,
    callerName,
  ) {
    warnNoop(publicInstance, 'replaceState');
  },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} Name of the calling function in the public API.
   * @internal
   */
  enqueueSetState: function(
    publicInstance,
    partialState,
    callback,
    callerName,
  ) {
    warnNoop(publicInstance, 'setState');
  },
};

export default ReactNoopUpdateQueue;
