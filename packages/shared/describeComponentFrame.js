/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
//用于匹配路径(linux或者windows路径)：字符串中"\"或者"/"之前的所有字符（除换行\n,\r）部分
const BEFORE_SLASH_RE = /^(.*)[\\\/]/;

export default function(
  name: null | string,
  source: any,
  ownerName: null | string,
) {
  let sourceInfo = '';
  if (source) {
    let path = source.fileName;
    let fileName = path.replace(BEFORE_SLASH_RE, '');
    if (__DEV__) {
      // In DEV, include code for a common special case:
      // prefer "folder/index.js" instead of just "index.js".
      if (/^index\./.test(fileName)) {
        const match = path.match(BEFORE_SLASH_RE);
        if (match) {
          const pathBeforeSlash = match[1];
          if (pathBeforeSlash) {
            const folderName = pathBeforeSlash.replace(BEFORE_SLASH_RE, '');
            fileName = folderName + '/' + fileName;
          }
        }
      }
    }
    sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')';
  } else if (ownerName) {
    sourceInfo = ' (created by ' + ownerName + ')';
  }
  return '\n    in ' + (name || 'Unknown') + sourceInfo;
}
