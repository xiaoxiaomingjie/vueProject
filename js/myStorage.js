/*作用：把原生的localStorage封装，使它在我们这个项目中更好用，更方便*/

/*做两个方法，并把它暴露出去*/

/*通过定义一个匿名函数，创建了一个新的函数作用域，
相当于创建了一个“私有”的命名空间，该命名空间的变量和方法，不会破坏污染全局的命名空间。*/
;(function(){
    /*把方法暴露出去*/
    window.ms = {
        set: set,
        get: get,
    };

    /*存数据的方法*/
    function set(key, val){
        localStorage.setItem(key, JSON.stringify(val));
    }
    /*取数据的方法*/
    function get(key){
        var json = localStorage.getItem(key);
        if(json)
        {
            return JSON.parse(json);
        }
    }

})();

/*在另一个文件中使用
* ms.set('name', '王花花');
* var val = ms.get('name');
* console.log(val);
* */