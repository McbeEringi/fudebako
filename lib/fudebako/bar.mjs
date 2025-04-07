#!/usr/bin/env -S LD_PRELOAD=/usr/lib/libgtk4-layer-shell.so gjs -m
//import Gettext,{gettext as _} from 'gettext';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import LayerShell from 'gi://Gtk4LayerShell';
//Gettext.textdomain('gtk40');


/*

{
	icon?:Gtk.Icon,
	txt:String,
	exec:Function(Gtk.Window),
	menu?:[
		{
			txt:String,
			exec:Function(Gtk.Window)
		},
		...
	],
	keywords:{
		[weight<Number>]:[
			keyword<String>
		],
		...
	}
}


	*/

const
bar=({
	title='fdbk-bar',
}={})=>((
	app=new Gtk.Application({application_id:'dev.mcbeeringi.fudebako-bar',flags:Gio.ApplicationFlags.NON_UNIQUE})
)=>(
	app.connect('activate',_=>(
		((
			box=new Gtk.Button({label:'hello'}),
			win=new Gtk.ApplicationWindow({
				application:app,child:box,
				title
				//decorated:false,
			}),
		)=>(
			LayerShell.init_for_window(win),
			LayerShell.set_layer(win,LayerShell.Layer.TOP),
			LayerShell.set_anchor(win,LayerShell.Edge.TOP,true),
			// LayerShell.set_exclusive_zone(win,32),
			LayerShell.auto_exclusive_zone_enable(win),
			// LayerShell.set_keyboard_mode(win,LayerShell.KeyboardMode.EXCLUSIVE),
			win.present(),
			0
		))()
	)),
	app.run([])
))();

bar();
