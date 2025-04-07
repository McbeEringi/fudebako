#!/usr/bin/env -S gjs -m
//#!/usr/bin/env -S LD_PRELOAD=/usr/lib/libgtk4-layer-shell.so gjs -m
//import Gettext,{gettext as _} from 'gettext';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Gdk from 'gi://Gdk?version=4.0';
//import LayerShell from 'gi://Gtk4LayerShell';
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
menu=({
	title='fdbk-menu',
	defaultWidth=480,defaultHeight=480,
	items=[]
}={})=>((
	app=new Gtk.Application({application_id:'dev.mcbeeringi.fudebako-menu',flags:Gio.ApplicationFlags.NON_UNIQUE})
)=>(
	app.connect('activate',_=>(
		((
			box=new Gtk.Box({orientation:Gtk.Orientation.VERTICAL}),
			hbar=new Gtk.HeaderBar,
			win=new Gtk.ApplicationWindow({
				application:app,child:box,
				title,
				titlebar:hbar,
				//decorated:false,
				defaultWidth,defaultHeight
			}),
			sinp=new Gtk.SearchEntry({search_delay:50,hexpand:true}),
			sbtn=new Gtk.ToggleButton({icon_name:'system-search-symbolic'}),
			spn=new Gtk.Spinner({spinning:true}),
			sbar=new Gtk.SearchBar({key_capture_widget:win,child:sinp}),
			ul=new Gtk.FlowBox({
				max_children_per_line:1,
				homogeneous:true,
				selection_mode:Gtk.SelectionMode.SINGLE,
				valign:Gtk.Align.START,
			}),
			scr=new Gtk.ScrolledWindow({vexpand:true,child:ul}),
			esc=_=>(key=>(
				key.connect('key-pressed',(_,k)=>k==Gdk.KEY_Escape&&win.close()),
				key
			))(new Gtk.EventControllerKey),
			lm=new Gtk.SortListModel({
				sorter:Gtk.CustomSorter.new((a,b)=>Math.sign(b.p-a.p)),
				incremental:true,
				model:new Gtk.FilterListModel({
					filter:Gtk.CustomFilter.new((w,s=sinp.text.toLowerCase(),ss=new RegExp(`\\s${s}`))=>(
						w.p=s?Object.entries(w.x.keywords).reduce((a,[i,x])=>(
							x.reduce((a,x)=>x?(
								x=x.toLowerCase(),
								a||x.includes(s)&&a++,// base point to display
								a&&a+i*(+x.startsWith(s)||.5*ss.test(x))/(Math.abs(s.length-x.length)+1)// match point
							):a,a)
						),0):-w.i-1,//Infinity,
						w.p
					)),
					incremental:true,
					model:(w=>(
						GLib.idle_add(
							GLib.PRIORITY_DEFAULT_IDLE,
							_=>items.forEach((x,i)=>w.append(Object.assign(new GObject.Object,{x,i})))
						),
						w
					))(new Gio.ListStore)
				})
			}),
		)=>(
			//LayerShell.init_for_window(win),
			//LayerShell.set_layer(win,LayerShell.Layer.TOP),
			//LayerShell.set_keyboard_mode(win,LayerShell.KeyboardMode.EXCLUSIVE),
			ul.bind_model(lm,(
				{x,i,p},
				box=new Gtk.Box,
				li=new Gtk.FlowBoxChild({child:box})
			)=>(
				x.icon&&(x=>(
					x=Gtk.Image.new_from_gicon(x),
					x.icon_size=Gtk.IconSize.LARGE,
					box.append(x)
				))(x.icon),
				box.append(new Gtk.Label({label:x.txt})),
				// box.append(new Gtk.Label({hexpand:true,xalign:1,label:p+''})),
				x.menu&&(li.tooltip_text=x.menu.map(x=>x.txt).join('\n')),
				Object.assign(li,{x,i,p}),
				li.connect('activate',_=>li.p&&(x.exec(win)||win.close())),
				li
			)),
			sinp.connect('search-changed',_=>(
				lm.model.filter.changed(Gtk.FilterChange.DIFFERENT)
			)),
			sinp.connect('activate',w=>(w=ul.get_child_at_index(0))&&w.p&&(w.x.exec(win)||win.close())),

			lm.connect('notify::pending',w=>spn.spinning=!!w.pending),
			sinp.add_controller(esc()),// BUG: hiding search bar by esc key causes high load. GTK bug?
			sbtn.bind_property('active',sbar,'search-mode-enabled',GObject.BindingFlags.BIDIRECTIONAL),

			hbar.pack_start(sbtn),
			hbar.pack_start(spn),

			box.append(sbar),
			box.append(scr),

			win.add_controller(esc()),
			win.connect('close-request',_=>lm.model=null),
			win.present(),
			0
		))()
	)),
	app.run([])
))();

export{menu};
