;(function(){
    'use strict';
    var alert_sound = document.getElementById('alert_sound');

    function copy(obj){
        return Object.assign({},obj);
    }
    var Event = new Vue(); //事件调度器用来操作子组件和父组件之间的通信。
    Vue.component('task',{
        template: '#task-tpl',
        props: ['todo'],
        methods: {
            action: function(name,params){     /*告诉父组件子组件想做什么*/
                Event.$emit(name,params);  /*触发name事件*/
             }
        },

    });
    /*这个应用只有一页，所以用单例的形式来储存数据。*/
    new Vue({
        el: '#main',
        data: {
            list: [],
            last_id: 0,

            /*input中的内容。*/
            current: {
                title: '',
                alert_at: '',
                desc: '',
            },
        },

        /*在每次应用初始化的时候，把localstorage中的数据取出来。*/
        mounted: function(){
            var me = this;
            this.list = ms.get('list') || [];
            this.last_id = ms.get('last-id') || this.last_id;

           /*每当应用打开，即mounted时，检查是否有需要提醒的任务*/
            setInterval(function(){
                me.check_alerts();
            },1000);

            /*初始化时监测子组件触发的事件*/
            Event.$on('remove',function(id){
                if(id)
                {
                    me.remove(id);
                }
            });
            Event.$on('toggle_complete',function(id){
                if(id)
                {
                    me.toggle_complete(id);
                }
            });
            Event.$on('set_current',function(todo){
                if(todo)
                {
                    me.set_current(todo);
                }
            });
            Event.$on('toggle_detail',function(id){
                if(id)
                {
                    me.toggle_detail(id);
                }
            });
        },
        methods: {
            check_alerts: function(){
                var me = this;
                this.list.forEach(function(row,i){
                    var alert_at = row.alert_at;
                    if(!alert_at || row.alert_confirmed)
                    {
                        return;
                    }else{
                        var timestamp = new Date(alert_at).getTime();/*获取时间戳*/
                        var nowstamp = new Date().getTime();
                        if(timestamp <= nowstamp)
                        {
                            alert_sound.play();

                            var confirmed = confirm(row.title + '时间到');/*是否已确认*/
                            Vue.set(me.list[i],'alert_confirmed',confirmed);



                        }

                    }

                })
            },
            /*1.添加或者更新*/
            /*判断是添加还是更新要使用id来判断*/
            merge: function(){
                var is_update ,id;
                is_update = id = this.current.id;
                if(is_update)
                {
                    var index = this.find_index(id);

                    /*this.list[index] = Object.assign({},this.current);*/
                    /*上面的数组的元素修改的方法vue不能识别，下面这种才可以。*/
                    Vue.set(this.list,index,copy(this.current));


                }else{
                    if(!this.current.title && this.current.title !==0)
                    {
                        return;
                    }
                    var todo = copy(this.current);/*拷贝这个对象*/
                    this.last_id ++;
                    ms.set('last_id',this.last_id);
                    todo.id = this.last_id;
                    this.list.push(todo);/*this.current一直是个引用，并没有拷贝数据，*/
                }
                this.reset_current();
            },
            /*3.删除*/
            remove: function(id){
                var index = this.find_index(id);
                this.list.splice(index,1);/*索引从id开始，删除一个元素。*/
            },
            next_id: function(){
                return this.list.length + 1;
            },

            set_current: function(todo){
                this.current = copy(todo);
            },
            reset_current: function () {
                this.set_current({});
            },
            find_index: function(id){
                return this.list.findIndex(function(item){
                    return item.id === id;
                });/*find()方法会把数组迭代，返回他找到的满足条件的第一个元素*/
            },
            toggle_complete: function(id){
                var index = this.find_index(id);
                Vue.set(this.list[index],'completed',!this.list[index].completed);
                /*this.list[index].complete = !this.list[index].complete;*/
            },
            toggle_detail: function(id){
                var index = this.find_index(id);
                Vue.set(this.list[index],'show_detail',!this.list[index].show_detail);
                /*this.list[index].show_detail = !this.list[index].show_detail*/
            }
        },

        /*监测list的变化，只要他有变化，就执行handler方法。*/
        watch: {
            list: {
                deep: true,
                handler: function(n,o){
                    if(n)
                    {
                        ms.set('list', n);
                    }else{
                        ms.set('list',[]);
                    }
                }
            }
        }
    });
})();