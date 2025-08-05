use gtk4 as gtk;
use gtk::prelude::*;
use gtk::{glib,gio,gdk};
use gtk4_layer_shell::{KeyboardMode,LayerShell};
use fdbk_object::FDBKObject;
// use num_traits::sign::signum;

// https://github.com/gtk-rs/gtk4-rs/tree/main/book/listings/list_widgets/2/integer_object
mod fdbk_object{
	mod imp{
		use gtk4 as gtk;
		use std::cell::{Cell,RefCell};

		use glib::Properties;
		use gtk::{glib,gio};
		use gtk::prelude::*;
		use gtk::subclass::prelude::*;

		// Object holding the state
		#[derive(Properties,Default)]
		#[properties(wrapper_type=super::FDBKObject)]
		pub struct FDBKObject{
			#[property(get,set)]
			number:Cell<i32>,
			#[property(get,set)]
			txt:RefCell<String>,
			#[property(get,set)]
			icon:RefCell<Option<gio::Icon>>,
		}

		// The central trait for subclassing a GObject
		#[glib::object_subclass]
		impl ObjectSubclass for FDBKObject{
			const NAME:&'static str="FudebakoObject";
			type Type=super::FDBKObject;
		}

		// Trait shared by all GObjects
		#[glib::derived_properties]
		impl ObjectImpl for FDBKObject{}
	}

	use gtk4 as gtk;
	use glib::Object;
	use gtk::prelude::*;
	use gtk::{glib,gio};

	fn default_icon()->Option<gio::Icon>{Some(gio::ThemedIcon::new("application-x-executable").upcast())}

	glib::wrapper!{pub struct FDBKObject(ObjectSubclass<imp::FDBKObject>);}
	impl FDBKObject{
		pub fn new(txt:&str)->Self{Object::builder().property("txt", txt).build()}
		pub fn builder()->FDBKObjectBuilder{FDBKObjectBuilder::default()}
	}

	#[derive(Default)]
	pub struct FDBKObjectBuilder{
		number:Option<i32>,
		txt:Option<String>,
		icon:Option<gio::Icon>,
	}
	impl FDBKObjectBuilder{
		pub fn number(mut self,x:i32)->Self{self.number=Some(x);self}
		pub fn txt<S:Into<String>>(mut self,x:S)->Self{self.txt=Some(x.into());self}
		pub fn icon(mut self,x:&gio::Icon)->Self{self.icon=Some(x.clone());self}
		pub fn build(self)->FDBKObject{
			let mut w=glib::Object::builder();
			if let Some(x)=self.number {w=w.property("number",x);}
			if let Some(x)=self.txt {w=w.property("txt",x);}
			if let Some(x)=self.icon {w=w.property("icon",x);}
			w.build()
		}
	}
}


fn menu(app:&gtk::Application,model:gio::ListStore){
	let vbox=gtk::Box::builder().orientation(gtk::Orientation::Vertical).build();
	let hbar=gtk::HeaderBar::new();
	let win=gtk::ApplicationWindow::builder()
		.application(app).child(&vbox).titlebar(&hbar).title("fdbk-menu")
		.default_width(480).default_height(480).build();
	let sinp=gtk::SearchEntry::builder().search_delay(50).hexpand(true).build();
	let sbtn=gtk::ToggleButton::builder().icon_name("system-search-symbolic").build();
	let spn=gtk::Spinner::builder().spinning(true).build();
	let sbar=gtk::SearchBar::builder().key_capture_widget(&win).child(&sinp).build();
	let filter=gtk::CustomFilter::new(|_x|true);
	let sorter=gtk::CustomSorter::new(|_a,_b|gtk::Ordering::Equal);
	let ul=gtk::ListView::builder()
		.model(&(
			gtk::SingleSelection::new(Some(gtk::SortListModel::builder()
				.incremental(true).sorter(&sorter)
				.model(&gtk::FilterListModel::builder()
					.incremental(true).filter(&filter)
					.model(&model).build()
				).build()
			))
		))
		.factory(&(||{
			let factory=gtk::SignalListItemFactory::new();
			factory.connect_setup(move|_,x|{
				let hbox=gtk::Box::builder().orientation(gtk::Orientation::Horizontal).build();
				let img=gtk::Image::builder()
					.gicon(&gio::Icon::for_string("application-x-executable").unwrap())
					.icon_size(gtk::IconSize::Large).build();
				let pic=gtk::Picture::builder().height_request(128).build();
				let txt=gtk::Label::new(None);
				hbox.append(&img);
				hbox.append(&pic);
				hbox.append(&txt);
				x.downcast_ref::<gtk::ListItem>().expect("Needs to be ListItem")
					.set_child(Some(&hbox));
			});
			factory.connect_bind(move|_,x|{
				let li=x.downcast_ref::<gtk::ListItem>().expect("Needs to be ListItem");
				let hbox=li.child().and_downcast::<gtk::Box>().expect("Needs to be Box");
				let img=hbox.first_child().and_downcast::<gtk::Image>().expect("Needs to be Image");
				let pic=img.next_sibling().and_downcast::<gtk::Picture>().expect("Needs to be Picture");
				let txt=pic.next_sibling().and_downcast::<gtk::Label>().expect("Needs to be Label");
				let obj=li.item().and_downcast::<FDBKObject>().expect("Needs to be StringObject");
				pic.set_visible(false);
				if obj.icon().is_none() {
					img.set_visible(false);
				}else{
					img.set_visible(true);
					img.set_from_gicon(&obj.icon().unwrap());
				}
				// txt.set_text(&obj.number().to_string());
				txt.set_text(&obj.txt());
			});
			factory
		})())
		// .max_children_per_line(1)
		// .selection_mode(gtk::SelectionMode::Single)
		.valign(gtk::Align::Start)
		.build();
	let scr=gtk::ScrolledWindow::builder().vexpand(true).child(&ul).build();
	let esc=||{
		let e=gtk::EventControllerKey::new();
		e.connect_key_pressed(|_,key,_,_|{
			match key{
				gdk::Key::Escape=>std::process::exit(0),
				_=>(),
			}
			glib::Propagation::Proceed
		});
		e
	};

	sbtn
		.bind_property("active",&sbar,"search-mode-enabled")
		.bidirectional().build();
	hbar.pack_start(&sbtn);
	hbar.pack_start(&spn);
	vbox.append(&sbar);
	vbox.append(&scr);
	ul.grab_focus();
	win.add_controller(esc());
	win.init_layer_shell();
	win.set_keyboard_mode(KeyboardMode::Exclusive);
	win.present();
}

fn on_activate(app:&gtk::Application){
	// gtk::StringList::new(&vec!["apple", "banana", "cherry", "date"]).clone()
	// (||->gtk::StringList{(0..=100_000).map(|number| number.to_string()).collect()})()
	menu(
		app,
		(||->gio::ListStore{
			let w=gio::ListStore::new::<FDBKObject>();
			w.append(&FDBKObject::builder().txt("Hello").build());
			w.append(&FDBKObject::builder().txt("ListView").build());
			w
		})()
	);
}

fn main(){
	let app=gtk::Application::builder()
		.application_id("me.6ca.fdbk-menu")
		.flags(gio::ApplicationFlags::NON_UNIQUE)
		.build();
	app.connect_activate(on_activate);
	app.run();
}
