#!/usr/bin/env -S LD_PRELOAD=/usr/lib/libgtk4-layer-shell.so gjs -m
//import Gettext,{gettext as _} from 'gettext';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
import Graphene from 'gi://Graphene';
import LayerShell from 'gi://Gtk4LayerShell';
//Gettext.textdomain('gtk40');


const
bar=({
	title='fdbk-bar',
}={})=>((
	app=new Gtk.Application({application_id:'dev.mcbeeringi.fudebako-bar',flags:Gio.ApplicationFlags.NON_UNIQUE})
)=>(
	app.connect('activate',_=>(
		((
			sb=new Gtk.Box,
			cb=new Gtk.Box,
			eb=new Gtk.Box,
			win=new Gtk.ApplicationWindow({
				application:app,title,decorated:false,
				child:new Gtk.CenterBox({
					start_widget:sb,center_widget:cb,end_widget:eb
				}),
			})
		)=>(
			LayerShell.init_for_window(win),
			LayerShell.set_layer(win,LayerShell.Layer.TOP),
			LayerShell.set_anchor(win,LayerShell.Edge.TOP,true),
			LayerShell.set_anchor(win,LayerShell.Edge.LEFT,true),
			LayerShell.set_anchor(win,LayerShell.Edge.RIGHT,true),
			LayerShell.auto_exclusive_zone_enable(win),
			// LayerShell.set_exclusive_zone(win,32),
			// LayerShell.set_keyboard_mode(win,LayerShell.KeyboardMode.EXCLUSIVE),
			sb.append(new Gtk.Button({label:'hello'})),
			cb.append(new Gtk.Button({label:'hello'})),
			eb.append(new Gtk.Button({label:'hello'})),
			win.present(),
			0
		))()
	)),
	app.run([])
))();

bar();
