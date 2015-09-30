// This was set up using the help of this tut:
//http://merrickchristensen.com/articles/gruntjs-workflow.html
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        autoprefixer: {
            app: {
                options: {
                    browsers: ['last 2 versions', 'ie 8', 'ie 9'],
                    cascade: true,
                    safe: false,//safe, while well-intentioned, is…just not a good idea
                },
                src: 'out/css/app.css',
                dest: 'out/css/app.css',
            },
        },

        //set up concats
        concat: {
            options: {
                // Get the filepath for all js files and format it to be a
                //   separator for easier debugging in concatted files
                process: function(src, filepath){
                    var lines = '\n//--------------------------------------------------\n'
                    var final_name = filepath.substring(filepath.lastIndexOf('/scripts/') + 1, filepath.length);//.join('-');
                    return( lines
                            + '// Source: '
                            + final_name
                            + lines
                            + src);
                }
            },

            app: {
                src: [
                    'in/js/vend/jquery-2.1.4.js',
                    'in/js/vend/bootstrap.js',
                    'in/js/legacy/*.js',
                    'in/js/lib/*.js'
                ],
                dest: 'out/js/app.js',
                nonull: true
            },
        },

        sass: {
            app_dev: {
                files:{
                    'out/css/app.css' : 'in/sass/index.scss'
                }
            },

            app_prod: {
                options:{
                    style: 'compressed'
                },
                files: {
                    'out/css/app.css' : 'in/sass/index.scss'
                }
            }
        },

        uglify: {
          options: {
            mangle: false,
          },
          app: {
            files: {
              //uglify in place
              'out/js/app.js' : 'out/js/app.js'
            }
          }
        },

        //watch for stuff when we save
        watch: {
            app_js: {
                files: ['in/js/**/*.js'],
                tasks: ['concat:app']
            },

            app_css: {
                files: ['in/sass/**/*.scss', 'in/sass/*.scss'],
                tasks: ['sass:app_dev', 'autoprefixer:app']
            },
            svg: {
                files: ['in/svg/*.svg'],
                tasks: ['svgstore'],
            },
        },

        svgstore: {
            options: {
                prefix : '_icon-',
                svg: {
                    display: 'none',
                    xmlns: 'http://www.w3.org/2000/svg',
                },
                includedemo: true,
            },
            default : {
                files: {
                    'out/svg/svg_defs.svg' : ['in/svg/*.svg'],
                }
            }
        },
    });//initConfig

//-----------------------------------------------------------------------------
//CUSTOM CLI COMMANDS
    // All tasks we have going in the initconfig should be registered here. Else
    //   the cli won't know what we're asking
    grunt.registerTask('default', 'Compiles sass, concats js, builds SVG sprite.', function(n) {
      var tasklist = ['concat', 'sass:app_dev', 'autoprefixer:app', 'svgstore'];

      //watch should always be last
      if(grunt.option('watch')) {
        tasklist.push('watch')
      }

      grunt.task.run(tasklist);
    });

    grunt.registerTask('js', 'Concats javascript files,  pass --watch to concat as you go', function(n){
      var tasklist = ['concat:app'];

      //watch should always be last
      if(grunt.option('watch')) {
        tasklist.push('watch:app_js');
      }

      grunt.task.run(tasklist);
    });


    grunt.registerTask('css', 'Compiles sass to css. Pass --watch to compile as you go. Pass --ie to build the IE-specific styles', function(n){
      var tasklist = ['sass:app_dev', 'autoprefixer:app'];

      if(grunt.option('ie')) {
        tasklist.push('sass:app_ie');
      }

      //Watch should always be last
      if(grunt.option('watch')) {
        tasklist.push('watch:app_css');
      }

      grunt.task.run(tasklist);
    });

    grunt.registerTask('svg', 'Combines svg files into a new SVG sprite, pass --watch to combine as you go', function(n){
      var tasklist = ['svgstore'];

      //Watch should always be last
      if(grunt.option('watch')) {
        tasklist.push('watch:svg');
      }

      grunt.task.run(tasklist);
    });

    grunt.registerTask('prod', 'Compiles sass to compressed css, uglifies javascript, creates SVG sprite', function(n){
      var tasklist = ['concat:app_js', 'uglify:app_js', 'sass:app_prod', 'svgstore', 'autoprefixer:app'];
      grunt.task.run(tasklist);
    });
};
