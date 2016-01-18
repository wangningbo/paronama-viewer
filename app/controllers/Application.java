package controllers;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import play.Play;
import play.mvc.Controller;
import util.CubeMap;
import util.CubeMap.Face;
import util.CubeMap.FaceImageWriter;

public class Application extends Controller {
	private static final File dataDir = new File(Play.applicationPath, "data");

	public static void index() {
		String[] paths = dataDir.list();
		render((Object) paths);
	}

	public static void view(String path) {
		render(path);
	}

	public static void upload(File file) {
		if (file == null) {
			index();
		}
		String name = String.valueOf(System.currentTimeMillis());
		final File dir = new File(dataDir, name);
		dir.mkdirs();
		try {
			BufferedImage img = ImageIO.read(file);
			CubeMap.generate(img, new FaceImageWriter() {
				@Override
				public void write(BufferedImage image, Face face) throws IOException {
					File f = new File(dir, face.name() + ".jpg");
					ImageIO.write(image, "JPG", f);
				}
			});
			ImageIO.write(img, "JPG", new File(dir, "full.jpg"));
			view(name);
		} catch (IOException e) {
			dir.delete();
		}
	}

	public static void img(String path, String type) {
		if (path.indexOf('/') > -1 || path.indexOf('\\') > -1 || type.indexOf('/') > -1 || type.indexOf('\\') > -1) {
			notFound();
		} else {
			File f = new File(dataDir, path + "/" + type + ".jpg");
			renderBinary(f);
		}
	}
}