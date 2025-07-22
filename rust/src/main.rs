use gtk4 as gtk;
use gtk::prelude::*;
use gtk::{glib,gio,gdk};

fn on_activate(app: &gtk::Application){
	let vbox=gtk::Box::builder().orientation(gtk::Orientation::Vertical).build();
	let hbar=gtk::HeaderBar::new();
	let win=gtk::ApplicationWindow::builder()
		.application(app).child(&vbox).titlebar(&hbar).title("fdbk-menu").build();
	let sinp=gtk::SearchEntry::builder().search_delay(50).hexpand(true).build();
	let sbtn=gtk::ToggleButton::builder().icon_name("system-search-symbolic").build();
	let spn=gtk::Spinner::builder().spinning(true).build();
	let sbar=gtk::SearchBar::builder().key_capture_widget(&win).child(&sinp).build();
	let ul=gtk::FlowBox::builder()
		.max_children_per_line(1)
		.selection_mode(gtk::SelectionMode::Single)
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
	// win.connect("close-request",_=>lm.model=null);
	win.present();
}

fn main(){
	let app=gtk::Application::builder()
		.application_id("me.6ca.fdbk-menu")
		.flags(gio::ApplicationFlags::NON_UNIQUE)
		.build();
	app.connect_activate(on_activate);
	app.run();
}
