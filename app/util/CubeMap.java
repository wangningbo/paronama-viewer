package util;

import static java.lang.Math.PI;
import static java.lang.Math.atan2;
import static java.lang.Math.floor;
import static java.lang.Math.hypot;
import static java.lang.Math.min;

import java.awt.Point;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

public class CubeMap {
	public static enum Face {
		back(0, 1), left(1, 1), front(2, 1), right(3, 1), top(2, 0), bottom(2, 2);
		private final int xOff;
		private final int yOff;

		private Face(int xOff, int yOff) {
			this.xOff = xOff;
			this.yOff = yOff;
		}

		private int transX(int x, int edge) {
			return x + (edge * xOff);
		}

		private int transY(int y, int edge) {
			return y + (edge * yOff);
		}
	}

	public static interface FaceImageWriter {
		void write(BufferedImage image, Face face) throws IOException;
	}

	private static class P {
		double x;
		double y;
		double z;

		void set(double x, double y, double z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	}

	private static void trans(P p, Face face, int edge, int i, int j) {
		double a = 2.0 * i / edge;
		double b = 2.0 * j / edge;
		switch (face) {
		case back:
			p.set(-1.0, 1.0 - a, 3.0 - b);
			break;
		case left:
			p.set(a - 3.0, -1.0, 3.0 - b);
			break;
		case front:
			p.set(1.0, a - 5.0, 3.0 - b);
			break;
		case right:
			p.set(7.0 - a, 1.0, 3.0 - b);
			break;
		case top:
			p.set(b - 1.0, a - 5.0, 1.0);
			break;
		case bottom:
			p.set(5.0 - b, a - 5.0, -1.0);
			break;
		}
	}

	private static int r(int rgb) {
		return (rgb >> 16) & 0xFF;
	}

	private static int g(int rgb) {
		return (rgb >> 8) & 0xFF;
	}

	private static int b(int rgb) {
		return (rgb >> 0) & 0xFF;
	}

	private static int rgb(int r, int g, int b) {
		return ((255 & 0xFF) << 24) | ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | ((b & 0xFF) << 0);
	}

	public static void generate(BufferedImage source, FaceImageWriter writer) throws IOException {
		int w = source.getWidth();
		int h = source.getHeight();
		int edge = w / 4;

		P p = new P();
		for (Face face : Face.values()) {
			BufferedImage target = new BufferedImage(edge, edge, source.getType());
			for (int i = 0; i < edge; i++) {
				for (int j = 0; j < edge; j++) {
					trans(p, face, edge, face.transX(i, edge), face.transY(j, edge));
					double theta = atan2(p.y, p.x);
					double r = hypot(p.x, p.y);
					double phi = atan2(p.z, r);
					double uf = (2.0 * edge * (theta + PI) / PI);
					double vf = (2.0 * edge * (PI / 2 - phi) / PI);
					int ui = (int) floor(uf);
					int vi = (int) floor(vf);
					int u2 = ui + 1;
					int v2 = vi + 1;
					int mu = (int) (uf - ui);
					int nu = (int) (vf - vi);
					int a = ui % w;
					int b = min(vi, h - 1);
					int c = u2 % w;
					int d = min(v2, h - 1);
					int A = source.getRGB(a, b);
					int B = source.getRGB(c, b);
					int C = source.getRGB(a, d);
					int D = source.getRGB(c, d);
					int rr = r(A) * (1 - mu) * (1 - nu) + r(B) * (mu) * (1 - nu) + r(C) * (1 - mu) * nu
							+ r(D) * mu * nu;
					int gg = g(A) * (1 - mu) * (1 - nu) + g(B) * (mu) * (1 - nu) + g(C) * (1 - mu) * nu
							+ b(D) * mu * nu;
					int bb = b(A) * (1 - mu) * (1 - nu) + b(B) * (mu) * (1 - nu) + b(C) * (1 - mu) * nu
							+ b(D) * mu * nu;
					target.setRGB(i, j, rgb(rr, gg, bb));
				}
			}
			writer.write(target, face);
		}
	}
}
