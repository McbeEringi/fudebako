#!/usr/bin/env -S gjs -m
//#!/usr/bin/env -S LD_PRELOAD=/usr/lib/libgtk4-layer-shell.so gjs -m
//import Gettext,{gettext as _} from 'gettext';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

import{menu}from'./menu.mjs';

const
drun=({
	default_icon:ico=Gio.Icon.new_for_string('application-x-executable')
}={})=>Gio.AppInfo.get_all().filter(x=>x.should_show()).map(x=>(
	x=Gio.DesktopAppInfo.new(x.get_id()),
	{
		icon:x.get_icon()??ico,
		txt:x.get_display_name(),
		exec:w=>{
			try{x.launch([],new Gio.AppLaunchContext());}
			catch(e){new Gtk.AlertDialog({message:e.message}).show(w);return 1;}
		},
		menu:x.list_actions().map(y=>({
			txt:x.get_action_name(y),
			exec:_=>x.launch_action(y,new Gio.AppLaunchContext())
		})),
		keywords:{
			16:[
				x.get_display_name(),
				x.get_generic_name()
			],
			8:[x.get_executable().split('/').at(-1)],
			1:[
				x.get_description(),
				...(x.get_categories()??'').split(';'),
				...x.get_keywords()??[]
			]
		}
	}
)),
bench=(n=10000)=>(
	n=[...Array(n)].map(_=>(_=Math.random().toFixed(6),{txt:_,keywords:{1:[_]}})),
	console.log('rand done'),
	n
);

menu({title:'launch...',items:drun()});
