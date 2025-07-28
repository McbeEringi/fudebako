use gtk4 as gtk;
use gtk::prelude::*;
use gtk::{glib,gio,gdk};
use gtk4_layer_shell::{KeyboardMode,LayerShell};
// use num_traits::sign::signum;

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
				let obj=li.item().and_downcast::<gtk::StringObject>().expect("Needs to be StringObject");
				img.set_visible(false);
				txt.set_text(&obj.string());
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
			let w=gio::ListStore::new::<glib::BoxedAnyObject>();
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
