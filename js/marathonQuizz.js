/**
 * jQuery marathonQuizz v0.0.3 - plugin for quizzes with localStorage history
 * 
 * Terms of Use - jQuery marathonQuizz plugin
 * under the MIT (http://www.opensource.org/licenses/mit-license.php) License.
 *
 * Copyright 2013 Marcin Papka All rights reserved.
 * alpteam.pl
 */


;(function ( $, window, document, undefined ) {

    
    var pluginName = "quizjs",
        defaults = {
            quizName:"",
            quizNumber:0,
            dataTest:"undefined",
            correct:3,
            firstshot:false,
            falseAnswer:[],
            falseInput:12,
            finished:false,
            lastAnswer:"",
            history:"on"
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function() {

            _this = this;
            this.options.dataTest = $(this.element).attr("data-test");
            this.options.quizName = $(this.element).attr("data-test_name");
            
            var df = $(this.element).attr("data-false");
            df ? this.options.falseAnswer = df.split(",") :  this.options.falseAnswer = [];

            this.options.quizNumber = qGlobal.quizNumber++;

            $(this.element).children().find('.numb').text( this.options.quizNumber );

            this.appendFalseInput(this.element, this.options);

            $(this.element).children().next().find('input[name='+'ans'+ this.options.quizNumber +']').on('click', $.proxy( this.bindStars, this, this.element, this.options )  );
            
            this.localStorageHistory(this.element, this.options);

        },

        appendFalseInput: function(el, options) {
           
            var element = $(el).children(".two_column");
            var str = '<label class=\"radio\"><input type=\"radio\" name=\"ans'+ options.quizNumber +'\" value=\"';
            
            var ans = rand2( options.falseAnswer );

            var allInput = "";

            for ( var i = 0 ; i < options.falseInput; i++ ){
                allInput = allInput + str + ans[i] + '\">' + ans[i] +  '</label>';
            } 
            element.append( allInput );

            function rand2(){
                var falseTab = _.shuffle(qGlobal.falseAnswers);
                falseTab = falseTab.slice(0, options.falseInput - options.falseAnswer.length );
 
                falseTab = falseTab.concat( options.falseAnswer );
                if ( !_.contains (falseTab, options.dataTest ) ) { falseTab.splice(0,1, options.dataTest ); } 
                falseTab = _.shuffle(falseTab);
                return _.uniq(falseTab); 

            }
        },
            
        addStars:   function(where, numbers){
            var str = "";
            for ( var i = 0; i< numbers; i++){
                str = str + '<img src=\"img/star.png\">';
            }
            where.append(str);
        },
        addExcl:    function(where){
            where.append( '<img src=\"img/ex.png\">' )
        },
        finishQ:     function(where){
            where.find('input').attr('disabled','disabled').off();
            where.children(":first").children("pre").css("opacity",0.7);
            where.find('.expl').show(69);

            this.saveLocalStorage();
        },
        bindStars:  function(el, options, event) {
            options.lastAnswer = $(event.target).val();

            if ( options.lastAnswer === options.dataTest ){
                if ( options.correct === 3 ) {
                    this.addStars ( $(el).children(":first"), 3 ); 
                    this.finishQ ( $(el) );
                    qGlobal.points++;
                    $(el).css('background-color','YellowGreen');
                   
                }
                else{
                    this.addStars ( $(el).children(":first"), options.correct );
                    this.finishQ ( $(el) );
                    qGlobal.points = qGlobal.points + ( options.correct / 10 );
                    $(el).css('background-color',"#DCFA9E");
                }
                    $(event.target).parent().css("font-weight","bold");
                    $('#sticker').text (qGlobal.points);
                    options.finished = true;
            }
            //wrong answers
            else{
                if ( options.correct === 1 ){
                    this.addExcl(  $(el).children(":first") );
                    this.finishQ ( $(el) );
                    options.finished = true;
                    $(el).css('background-color',"#F5D9E4");
                }

            options.correct--;
            }
//                $(el).parent().find('input[name='+'ans'+ this.options.quizNumber +']').off();

        },
        localStorageHistory:   function(el, options){
          if ( localStorage.getItem("rightQuizz") === null ) { return false;}
          var ob = JSON.parse ( localStorage.getItem("rightQuizz") );
          if ( ob[ options.quizNumber ] ) {
              options.correct = ob[ options.quizNumber ][0];
              var test =  $(el).children().find('input[value="'+ob[options.quizNumber][1] +'"]' );
              //if previous false value is not present then just find input
              if ( test.length > 0 ){
                  $(el).children().find('input[value="'+ob[options.quizNumber][1] +'"]' ).trigger('click');
              }
              else{
                  $(el).children().find('input').trigger('click');
              }
          }
        },
        saveLocalStorage:     function(){
          if ( localStorage.getItem("rightQuizz") === null ) { var x = {}; localStorage.setItem( 'rightQuizz', JSON.stringify(x) ); }

          var ob = JSON.parse ( localStorage.getItem("rightQuizz") );
          var str = this.options.lastAnswer
                
          str = str.replace(/\[/g,"\[");
          str = str.replace(/\]/g,"\]");

          ob[ this.options.quizNumber ] = [ this.options.correct, str ];
          
          localStorage.setItem( 'rightQuizz', JSON.stringify(ob) );
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );

   
