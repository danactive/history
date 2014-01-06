/*global module*/

module.exports = function (grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		develop: {
			history: {
				file: 'app.js'
			}
		},
		dot: {
			browser: {
				options: {
					variable: 'doT'
				},
				src: ['views/*.dot','!views/*.node.dot'],
				dest: 'public/views.js'
			},
			node: {
				src: ['views/*.node.dot']
			}
		},
		jshint: {
			options: {
				curly: true,
				eqnull: true,
				immed: true,
				latedef: true,
				loopfunc: true,
				noarg: true,
				sub: true,
				undef: true
			},
			adminJs: ['gruntfile.js', 'package.json', 'app.js', 'admin/*.js', 'test/*.js'],
			viewJs: ['js/*.js', '!js/album.js', '!js/edit_admin_xml.js', '!<%= jshint.viewJsDebug.files.src %>'],
			viewJsDebug: {
				options: {
					debug: true
				},
				files: {
					src: ['js/global.js']
				}
			}
		},
		uglify: {
			viewJs: {
				files: {
					'public/lib.min.js': 'lib/**/*.js'
				}
			}
		},
		watch: {
			js: {
				files: [
					'<%= develop.history.file %>',
					'<%= dot.browser.src %>',
					'<%= dot.node.src %>',
					'js/admin-*.js'
				],
				tasks: ['develop', 'dot:browser'],
				options: { nospawn: true }
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-develop');
	grunt.loadNpmTasks('grunt-dot-compiler');

	grunt.registerTask('dev', ['jshint', 'develop', 'watch']);

	grunt.registerTask('compile', ['jshint', 'uglify', 'dot:browser']);
};