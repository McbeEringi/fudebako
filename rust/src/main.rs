use gtk4 as gtk;
use gtk::prelude::*;
use gtk::glib;
use gtk::gio;

fn on_activate(app: &gtk::Application) {
	let button = gtk::Button::builder()
		.label("Hello World!")
		.build();
	let window = gtk::ApplicationWindow::builder()
		.application(app)
		.child(&button)
		.build();
	button.connect_clicked(glib::clone!(@weak window => move |_| window.close()));
	window.present();
}

fn main() {
	let app = gtk::Application::builder()
		.application_id("com.github.gtk-rs.examples.basic")
		.flags(gio::ApplicationFlags::NON_UNIQUE)
		.build();
	app.connect_activate(on_activate);
	app.run();
}

