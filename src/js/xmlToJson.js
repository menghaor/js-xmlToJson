/**
 * XML to JSON
 * 
 * Desc: xml to json Object
 * Author: Haor
 * Creation time: 2020/03/16
 * 
 */
const XmlToJson = (function () {
    let self = this;

    /**
     * 是否为指定类型
     * @param {*} data 
     */
    self.isType = (data) => {
        let dataType = Object.prototype.toString.call(data).slice(8, -1);
        return isType => isType.toLowerCase() === dataType.toLowerCase();
    }

    /**
     * 转换Key
     * @param {Object | Array}obj
     * @param {Object} keyMap 
     * @param {Boolean} isDeep 是否深度
     * @return Object/Array
     */
    self.convertKey = (obj, keyMap, isDeep) => {
        if (!['[object Array]', '[object Object]'].includes(Object.prototype.toString.call(obj))) {
            throw new TypeError('The first argument should be either an object or an array！');
        }
        if (Object.prototype.toString.call(keyMap) !== '[object Object]') {
            throw new TypeError('The parameter keyMap should be an object!');
        }
        let res = obj instanceof Array ? [] : {};
        if (obj instanceof Object) {
            for (let key in obj) {
                let newKey = Object.keys(keyMap).includes(key) ? keyMap[key] : key;
                res[newKey] = obj[key];

                //是否为深度转换
                if (isDeep && obj[key] instanceof Object && Object.keys(obj[key]).length) {
                    res[newKey] = self.convertKey(obj[key], keyMap, isDeep);
                }
            }
        }
        return res;
    }

    /**
     * 通过传入xml的内容字符串来解析xml文档
     * @param xmlString xml字符串
     * @returns xml的Document对象
     */
    self.convertXMLStringToDoc = xmlString => {
        let xmlDoc = null;
        if (window.DOMParser) {
            let parser = new DOMParser();
            xmlDoc = parser.parseFromString(xmlString, "text/xml");
        } else {
            //IE
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlString);
        }
        return xmlDoc;
    }

    /**
     * 查询节点所有属性
     * @param node 当前元素
     * @returns Object
     */
    self.queryNodeAttrs = node => {
        if (!node.hasAttributes || !node.hasAttributes()) return {};
        let attrs = {};
        const len = node.attributes.length;
        for (let i = 0; i < len; i++) {
            let it = node.attributes[i];
            attrs[it.name] = it.value;
        }
        return attrs;
    }

    /**
     * 序列化xml
     * @param {String} xmlString
     * @param {Object} conf
     * @returns {Object} JSON
     */
    self.parse = (xmlString, conf) => {
        if (xmlString && typeof xmlString !== 'string') {
            throw new TypeError('The first argument should be a string!');
        }

        if (conf && !self.isType(conf)('object')) {
            throw new TypeError('The parse configuration should be an object!')
        }

        try {
            self.conf = conf;
            let { jsonString, conversionkeyMap } = conf;
            let xmlDocNodes = self.convertXMLStringToDoc(xmlString); //xml字符串转为Doc节点
            let nodes = self.parseNode({}, xmlDocNodes.firstChild);
            
            //has conversion key
            if (conversionkeyMap && self.isType(conversionkeyMap)('object')) {
                nodes = self.convertKey(nodes, conversionkeyMap, true);
            }

            return jsonString ? JSON.stringify(nodes) : nodes;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    /**
     * 序列化节点
     * @param {Object} parent
     * @param {Object} node
     * @returns {Object} JSON
     */
    self.parseNode = (parent, node) => {
        let { conf, parseValue, addToParent } = self;
        let obj = {
            ...self.queryNodeAttrs(node)
        };

        let { nodeName } = node;

        //is text node
        if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
            //has attr
            if (node.hasAttributes()) {
                obj[conf.textKey] = parseValue(node.childNodes[0].nodeValue);
            } else {
                obj = parseValue(node.childNodes[0].nodeValue)
            }
        }

        //do child
        else {
            self.parseChildren(obj, node.childNodes);
        }

        //append parent
        addToParent(parent, nodeName, obj);

        return parent;
    }

    /**
     * 序列化value
     * @param {String} val 
     */
    self.parseValue = (val) => {
        try {
            let num = Number(val);
            if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
                return val.toLowerCase() === 'true';
            } else if (isNaN(num)) {
                return val.trim();
            }  else {
                return num;
            }
        } catch (error) {
            return val;
        }
    }

    /**
     * 序列化子集
     * @param {Object} resJson 
     * @param {Array} childNodes 
     */
    self.parseChildren = (resJson, childNodes) => {
        if (childNodes.length) {
            for (let i = 0; i < childNodes.length; i++) {
                if (childNodes[i].nodeType === 1) {
                    self.parseNode(resJson, childNodes[i]);
                }
            }
        }
    }

    /**
     * 添加到parent
     * @param {Object} parent 父级数据
     * @param {String} nodeName 当前节点名
     * @param {Object} obj 
     */
    self.addToParent = (parent, nodeName, obj) => {
        if (!parent[nodeName]) {
            parent[nodeName] = obj;
        } else {
            if (!Array.isArray(parent[nodeName])) {
                let temp = parent[nodeName];
                parent[nodeName] = [];
                parent[nodeName].push(temp)
            }
            parent[nodeName].push(obj);
        }
    }

    //Exposed outside
    return {
        parse: function (xmlStr, conf) {
            let parseData = self.parse(xmlStr, conf);
            return parseData;
        }
    }
})()